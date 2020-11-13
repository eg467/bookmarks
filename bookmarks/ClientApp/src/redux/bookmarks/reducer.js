import * as actions from "./actions";
import * as pocketActions from "../pocket/bookmarks/actions";
import { createSelector } from "reselect";
import { SetOps } from "../../utils";
import { TagModification, noopBookmarkPersister, toArray, } from "../../api/bookmark-io";
import pocketApi from "../../api/pocket-api";
import produce from "immer";
export var BookmarkSourceType;
(function (BookmarkSourceType) {
    BookmarkSourceType[BookmarkSourceType["none"] = 0] = "none";
    BookmarkSourceType[BookmarkSourceType["pocket"] = 1] = "pocket";
    BookmarkSourceType[BookmarkSourceType["json"] = 2] = "json";
    BookmarkSourceType[BookmarkSourceType["savedJson"] = 3] = "savedJson";
    BookmarkSourceType[BookmarkSourceType["externalJson"] = 4] = "externalJson";
    BookmarkSourceType[BookmarkSourceType["browserBookmarks"] = 5] = "browserBookmarks";
})(BookmarkSourceType || (BookmarkSourceType = {}));
export const initialState = {
    bookmarks: {},
    sort: {
        field: "url",
        ascending: true,
    },
    filters: {
        andFilterTags: [],
        notFilterTags: [],
        orFilterTags: [],
        contentFilter: "",
    },
    source: {
        description: "Not loaded",
        type: BookmarkSourceType.none,
    },
    requestStates: {
        bulkRequests: {},
        byBookmark: {},
    },
};
//const modifyBookmarks = (keys: BookmarkKeys, oldBookmarks: BookmarkCollection, modifier: (bookmark: BookmarkData) => BookmarkData) => {
//    const bookmarks: BookmarkCollection = { ...oldBookmarks };
//    for (let key of toArray(keys)) {
//        bookmarks[key] = modifier(bookmarks[key]);
//    }
//    return bookmarks;
//}
const ciCollator = new Intl.Collator("en-US", { sensitivity: "accent" });
const ciCompare = (a, b) => ciCollator.compare(a, b) === 0;
const ciTagIndex = (q, tags) => tags.findIndex((t) => ciCompare(t, q));
export const createDirtyPartialSuccessResult = (keys) => {
    return { dirtyChange: true, successfulIds: toArray(keys), failureIds: [] };
};
export const standardizeTags = (tags) => tags.map((t) => t.toLowerCase());
const reducer = produce((state, action) => {
    const applyToIds = (results, transform) => results.successfulIds.forEach((id) => transform(state.bookmarks[id], id));
    switch (action.type) {
        case pocketActions.ActionType.FETCH_BOOKMARKS_SUCCESS: {
            const { bookmarks, source } = action.response;
            state.bookmarks = bookmarks;
            state.source = source;
            break;
        }
        case actions.ActionType.REMOVE_SUCCESS: {
            applyToIds(action.response, (_, id) => delete state.bookmarks[id]);
            break;
        }
        case actions.ActionType.ARCHIVE_SUCCESS: {
            applyToIds(action.response, (b) => (b.archive = action.payload.status));
            break;
        }
        case actions.ActionType.FAVORITE_SUCCESS: {
            applyToIds(action.response, (b) => (b.favorite = action.payload.status));
            break;
        }
        case actions.ActionType.MODIFY_TAGS_SUCCESS: {
            const { operation, tags } = action.payload;
            // TODO: standardize tags in one place.
            const modifiedTags = tags.toLocaleLowerCase().split(",");
            applyToIds(action.response, (b) => {
                switch (operation) {
                    case TagModification.add:
                        b.tags = [...new Set([...b.tags, ...modifiedTags])];
                        break;
                    case TagModification.remove:
                        const keysToRemove = new Set(modifiedTags);
                        b.tags = b.tags.filter((t) => !keysToRemove.has(t));
                        break;
                    case TagModification.set:
                        b.tags = modifiedTags;
                        break;
                }
                b.tags.sort();
            });
            break;
        }
        case actions.ActionType.RENAME_TAG_SUCCESS:
            const { oldTag, newTag } = action.payload;
            for (const b of Object.values(state.bookmarks)) {
                const io = ciTagIndex(oldTag, b.tags);
                if (io >= 0) {
                    b.tags[io] = newTag;
                }
            }
            break;
        case actions.ActionType.DELETE_TAG_SUCCESS:
            const { tag } = action.payload;
            for (const b of Object.values(state.bookmarks)) {
                const io = ciTagIndex(tag, b.tags);
                if (io >= 0) {
                    b.tags.splice(io, 1);
                }
            }
            break;
        case actions.ActionType.SORT: {
            const { ascendingOrder: ascending, field } = action;
            state.sort = { field, ascending };
            break;
        }
        case actions.ActionType.FILTER_CONTENT:
            state.filters.contentFilter = action.q;
            break;
        case actions.ActionType.FILTER_AND_TAGS:
            state.filters.andFilterTags = standardizeTags(action.tags);
            break;
        case actions.ActionType.FILTER_OR_TAGS:
            state.filters.orFilterTags = standardizeTags(action.tags);
            break;
        case actions.ActionType.FILTER_NOT_TAGS:
            state.filters.notFilterTags = standardizeTags(action.tags);
            break;
    }
}, initialState);
export default reducer;
export const selectBookmarks = (state) => state.bookmarks.bookmarks;
export const selectBookmark = (state, id) => state.bookmarks.bookmarks[id];
export const selectBookmarkList = createSelector([selectBookmarks], (bookmarks) => {
    return Object.keys(bookmarks).map((k) => bookmarks[k]);
});
export const selectBookmarkIds = createSelector([selectBookmarks], (bookmarks) => {
    return new Set(Object.keys(bookmarks));
});
export const selectAllTags = createSelector([selectBookmarkList], (bookmarks) => {
    const tags = new Set();
    bookmarks.forEach((b) => {
        b.tags.forEach((t) => tags.add(t));
    });
    return [...tags].sort();
});
// TODO: Change the below selectors to point from the root state instead of relative BookmarkState.
// SOURCE
const selectBookmarkSource = (state) => state.bookmarks.source;
const selectBookmarkPersister = createSelector([selectBookmarkSource], (src) => {
    if (!src) {
        return noopBookmarkPersister;
    }
    switch (src.type) {
        case BookmarkSourceType.pocket:
            return pocketApi;
        case BookmarkSourceType.savedJson:
            // TODO: create and change this to a jsonbin persister.
            return noopBookmarkPersister;
        default:
            return noopBookmarkPersister;
    }
});
const selectCapabilities = createSelector([selectBookmarkPersister], (persister) => (key) => !!persister[key]);
// FILTERS
const selectAndFilter = (state) => state.bookmarks.filters.andFilterTags;
const selectOrFilter = (state) => state.bookmarks.filters.orFilterTags;
const selectNotFilter = (state) => state.bookmarks.filters.notFilterTags;
const selectContentFilter = (state) => state.bookmarks.filters.contentFilter;
const _findMatchingBookmarks = (bookmarks, shouldFilter, filter) => shouldFilter
    ? new Set(bookmarks.filter(filter).map((b) => b.id))
    : null;
const selectAndMatchedBookmarkIds = createSelector([selectBookmarkList, selectAndFilter], (bookmarks, andFilter) => {
    return _findMatchingBookmarks(bookmarks, andFilter.length > 0, (b) => andFilter.every((t) => b.tags.includes(t)));
});
const selectOrMatchedBookmarkIds = createSelector([selectBookmarkList, selectOrFilter], (bookmarks, orFilter) => _findMatchingBookmarks(bookmarks, orFilter.length > 0, (b) => orFilter.some((t) => b.tags.includes(t))));
const selectNotMatchedBookmarkIds = createSelector([selectBookmarkList, selectNotFilter], (bookmarks, notFilter) => _findMatchingBookmarks(bookmarks, notFilter.length > 0, (b) => !notFilter.some((t) => b.tags.includes(t))));
const selectContentMatchedBookmarkIds = createSelector([selectBookmarkList, selectContentFilter], (bookmarks, contentFilter) => {
    if (!contentFilter) {
        return null;
    }
    const escapeRegExp = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp(escapeRegExp(contentFilter), "i");
    const matchIfExists = (text) => text ? regex.test(text) : false;
    function containsContent(b) {
        const fieldsToSearch = [
            b.url,
            b.excerpt,
            (b.authors || []).join(),
            b.title,
        ];
        return fieldsToSearch.some(matchIfExists);
    }
    return _findMatchingBookmarks(bookmarks, !!contentFilter, containsContent);
});
const selectFilteredBookmarkIds = createSelector([
    selectBookmarkIds,
    selectAndMatchedBookmarkIds,
    selectOrMatchedBookmarkIds,
    selectNotMatchedBookmarkIds,
    selectContentMatchedBookmarkIds,
], (bookmarkIds, andMatches, orMatches, notMatches, contentMatches) => {
    const filterMatches = [andMatches, orMatches, notMatches, contentMatches];
    const matchesForActiveFilters = filterMatches.filter((m) => m !== null);
    return matchesForActiveFilters.length
        ? SetOps.reduce(matchesForActiveFilters, SetOps.intersection)
        : new Set(bookmarkIds);
});
// END FILTERS
// SORTING
const selectSort = (state) => state.bookmarks.sort;
const selectSortedBookmarkIds = createSelector([selectBookmarks, selectFilteredBookmarkIds, selectSort], (bookmarks, filteredKeys, sort) => {
    const orderFactor = sort.ascending ? 1 : -1;
    const cmp = (a, b) => orderFactor * (a < b ? -1 : a > b ? 1 : 0);
    const regex = RegExp(/^(?:https?|ftp):\/\/www\d*\./i).compile();
    const domain = (url) => url.replace(regex, "");
    const comparisonsByField = {
        url: (a, b) => cmp(domain(a.url), domain(b.url)),
        title: (a, b) => cmp(a.title, b.title),
        date: (a, b) => cmp(a.time_added, b.time_added),
    };
    const compareBookmarksBySelectedField = comparisonsByField[sort.field];
    const sortByBookmarkId = (a, b) => compareBookmarksBySelectedField(bookmarks[a], bookmarks[b]);
    return [...filteredKeys].sort(sortByBookmarkId);
});
// END SORTING
// COMBINED SELECTORS
export const selectors = {
    selectBookmarkSource,
    selectBookmarkPersister,
    selectCapabilities,
    selectBookmarks,
    selectBookmark,
    selectAllTags,
    selectBookmarkIds,
    selectAndFilter,
    selectOrFilter,
    selectNotFilter,
    selectContentFilter,
    selectAndMatchedBookmarkIds,
    selectOrMatchedBookmarkIds,
    selectNotMatchedBookmarkIds,
    selectContentMatchedBookmarkIds,
    selectFilteredBookmarkIds,
    selectSort,
    selectSortedBookmarkIds,
};
// END COMBINED SELECTORS
