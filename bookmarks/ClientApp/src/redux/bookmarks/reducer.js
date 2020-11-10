"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectors = exports.selectAllTags = exports.selectBookmarkIds = exports.selectBookmarkList = exports.selectBookmark = exports.selectBookmarks = exports.standardizeTags = exports.createDirtyPartialSuccessResult = exports.initialState = exports.BookmarkSourceType = void 0;
const actions = require("./actions");
const pocketActions = require("../pocket/bookmarks/actions");
const reselect_1 = require("reselect");
const utils_1 = require("../../utils");
const bookmark_io_1 = require("../../api/bookmark-io");
const pocket_api_1 = require("../../api/pocket-api");
const immer_1 = require("immer");
var BookmarkSourceType;
(function (BookmarkSourceType) {
    BookmarkSourceType[BookmarkSourceType["none"] = 0] = "none";
    BookmarkSourceType[BookmarkSourceType["pocket"] = 1] = "pocket";
    BookmarkSourceType[BookmarkSourceType["json"] = 2] = "json";
    BookmarkSourceType[BookmarkSourceType["savedJson"] = 3] = "savedJson";
    BookmarkSourceType[BookmarkSourceType["externalJson"] = 4] = "externalJson";
    BookmarkSourceType[BookmarkSourceType["browserBookmarks"] = 5] = "browserBookmarks";
})(BookmarkSourceType = exports.BookmarkSourceType || (exports.BookmarkSourceType = {}));
exports.initialState = {
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
        byBookmark: {}
    }
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
const ciTagIndex = (q, tags) => tags.findIndex(t => ciCompare(t, q));
exports.createDirtyPartialSuccessResult = (keys) => {
    return { dirtyChange: true, successfulIds: bookmark_io_1.toArray(keys), failureIds: [] };
};
//class ActionHistoryManager {
//    private static setStateForRequest(state: StateByRequest, requestType: RequestType, requestState: RequestState): StateByRequest {
//        return {
//            ...(state || {}), [requestType]: requestState
//        };
//    }
//    private static removeOne(history: StateByRequest, requestType: RequestType): StateByRequest | undefined {
//        const { [requestType]: del, ...newHistory } = history;
//        return typeof del === "undefined"
//            ? history
//            : Object.keys(newHistory).length < 0
//                ? newHistory as StateByRequest
//                : undefined;
//    }
//    public static addGlobal(
//        history: RequestStates,
//        actionType: actions.ActionType,
//        entry?: RequestState
//    ): RequestStates {
//        const { bulkRequests: oldBulkRequests, ...rest } = history;
//        const bulkRequests = this.setStateForRequest(oldBulkRequests, actionType, entry);
//        return { ...rest, bulkRequests };
//    }
//    public static removeGlobal(
//        history: RequestStates,
//        actionType: actions.ActionType
//    ): RequestStates {
//        const { bulkRequests: oldBulkRequests, ...rest } = history;
//        const bulkRequests = this.removeOne(oldBulkRequests, actionType) || {};
//        return { ...rest, bulkRequests };
//    }
//    public static add(
//        history: RequestStates,
//        keys: BookmarkKeys,
//        actionType: actions.ActionType
//    ): RequestStates {
//        const { byBookmark: oldByBookmark, ...rest } = history;
//        const byBookmark = { ...oldByBookmark };
//        for (let bmKey of toArray(keys)) {
//            byBookmark[bmKey] = this.setStateForRequest(byBookmark[bmKey], actionType, {});
//        }
//        return { ...rest, byBookmark };
//    }
//    public static addWithEntry(
//        history: RequestStates,
//        keys: BookmarkKeys,
//        entry: RequestState,
//        actionType: actions.ActionType
//    ) {
//        return this.addWithEntries(
//            history,
//            toArray(keys).map(id => ({ id, entry })),
//            actionType);
//    }
//    public static addWithEntries(
//        history: RequestStates,
//        keysWithEntries: { id: string, entry: RequestState }[],
//        actionType: actions.ActionType
//    ) {
//        const { byBookmark: oldByBookmark, ...rest } = history;
//        const byBookmark = { ...oldByBookmark };
//        for (let bmKey of keysWithEntries) {
//            const { id, entry } = bmKey;
//            byBookmark[id] = this.setStateForRequest(byBookmark[id], actionType, entry);
//        }
//        return { ...rest, byBookmark };
//    }
//    public static remove(history: RequestStates, keys: BookmarkKeys, actionType: actions.ActionType): RequestStates {
//        const { byBookmark: oldByBookmark, ...rest } = history;
//        const byBookmark = { ...oldByBookmark };
//        for (let id of toArray(keys)) {
//            const bmHistory = byBookmark[id];
//            if (!bmHistory) { continue; }
//            const newBmHistory = this.removeOne(bmHistory, actionType);
//            if (newBmHistory) {
//                byBookmark[id] = newBmHistory;
//            } else {
//                delete byBookmark[id]
//            }
//        }
//        return { ...rest, byBookmark };
//    }
//}
exports.standardizeTags = (tags) => tags.map(t => t.toLowerCase());
const reducer = immer_1.default((state, action) => {
    function applyToIds(results, transform) {
        results.successfulIds.forEach(id => transform(state.bookmarks[id], id));
    }
    switch (action.type) {
        case pocketActions.ActionType.FETCH_BOOKMARKS_SUCCESS:
            {
                const { bookmarks, source } = action.response;
                state.bookmarks = bookmarks;
                state.source = source;
                break;
            }
        case actions.ActionType.REMOVE_SUCCESS:
            {
                applyToIds(action.response, (_, id) => delete state.bookmarks[id]);
                break;
            }
        case actions.ActionType.ARCHIVE_SUCCESS:
            {
                applyToIds(action.response, (b) => b.archive = action.payload.status);
                break;
            }
        case actions.ActionType.FAVORITE_SUCCESS:
            {
                applyToIds(action.response, (b) => b.favorite = action.payload.status);
                break;
            }
        case actions.ActionType.MODIFY_TAGS_SUCCESS:
            {
                let { operation, tags } = action.payload;
                // TODO: standardize tags in one place.
                const modifiedTags = tags.toLocaleLowerCase().split(",");
                applyToIds(action.response, b => {
                    switch (operation) {
                        case bookmark_io_1.TagModification.add:
                            b.tags = [...new Set([...b.tags, ...modifiedTags])];
                            break;
                        case bookmark_io_1.TagModification.remove:
                            const keysToRemove = new Set(modifiedTags);
                            b.tags = b.tags.filter(t => !keysToRemove.has(t));
                            break;
                        case bookmark_io_1.TagModification.set:
                            b.tags = modifiedTags;
                            break;
                    }
                    b.tags.sort();
                });
                break;
            }
        case actions.ActionType.RENAME_TAG_SUCCESS:
            const { oldTag, newTag } = action.payload;
            for (let b of Object.values(state.bookmarks)) {
                var io = ciTagIndex(oldTag, b.tags);
                if (io >= 0) {
                    b.tags[io] = newTag;
                }
            }
            break;
        case actions.ActionType.DELETE_TAG_SUCCESS:
            const { tag } = action.payload;
            for (let b of Object.values(state.bookmarks)) {
                var io = ciTagIndex(oldTag, b.tags);
                if (io >= 0) {
                    b.tags.splice(io, 1);
                }
            }
            break;
        case actions.ActionType.SORT:
            {
                const { ascendingOrder: ascending, field } = action;
                state.sort = { field, ascending };
                break;
            }
        case actions.ActionType.FILTER_CONTENT:
            state.filters.contentFilter = action.q;
            break;
        case actions.ActionType.FILTER_AND_TAGS:
            state.filters.andFilterTags = exports.standardizeTags(action.tags);
            break;
        case actions.ActionType.FILTER_OR_TAGS:
            state.filters.orFilterTags = exports.standardizeTags(action.tags);
            break;
        case actions.ActionType.FILTER_NOT_TAGS:
            state.filters.notFilterTags = exports.standardizeTags(action.tags);
            break;
    }
}, exports.initialState);
exports.default = reducer;
//export default function (state: BookmarkState = initialState, action: actions.BookmarkAction | pocketActions.PocketBookmarksAction): BookmarkState {
//    function modifyBookmark(ids: BookmarkKeys, fn: (b: BookmarkData) => BookmarkData) {
//        const { bookmarks: oldBookMarks } = state;
//        let bookmarks = { ...oldBookMarks };
//        for (let id of toArray(ids)) {
//            bookmarks
//        }
//    }
//    switch (action.type) {
//        case pocketActions.ActionType.FETCH_BOOKMARKS_SUCCESS:
//            const { bookmarks, source } = action.response;
//            return { ...state, bookmarks, source };
//        case actions.ActionType.SHOW:
//            return { ...state, bookmarks: action.bookmarks };
//        case actions.ActionType.REMOVE_SUCCESS:
//            {
//                const bookmarks: BookmarkCollection = {
//                    ...state.bookmarks,
//                };
//                const keys = action.payload.keys;
//                for (let id of toArray(keys)) {
//                    delete bookmarks[id];
//                }
//                return { ...state, bookmarks };
//            }
//        case actions.ActionType.ARCHIVE_SUCCESS:
//            {
//                const { keys, status } = action.payload;
//                return successTemplate(
//                    keys,
//                    b => ({ ...b, archive: status }),
//                    action.response,
//                    actions.ActionType.ARCHIVE,
//                    actions.ActionType.ARCHIVE_SUCCESS,
//                    actions.ActionType.ARCHIVE_FAILURE);
//            }
//        case actions.ActionType.ARCHIVE_FAILURE:
//            {
//                return failureTemplate(
//                    action.payload.keys,
//                    action.error,
//                    actions.ActionType.ARCHIVE,
//                    actions.ActionType.ARCHIVE_FAILURE);
//            }
//        case actions.ActionType.FAVORITE_SUCCESS:
//            {
//                const { keys, status } = action.payload;
//                return successTemplate(
//                    keys,
//                    b => ({ ...b, favorite: status }),
//                    action.response,
//                    actions.ActionType.FAVORITE,
//                    actions.ActionType.FAVORITE_SUCCESS,
//                    actions.ActionType.FAVORITE_FAILURE);
//            }
//        case actions.ActionType.FAVORITE_FAILURE:
//            {
//                return failureTemplate(
//                    action.payload.keys,
//                    action.error,
//                    actions.ActionType.FAVORITE,
//                    actions.ActionType.FAVORITE_FAILURE);
//            }
//        case actions.ActionType.MODIFY_TAGS_SUCCESS:
//            {
//                let { keys, operation, tags } = action.payload;
//                tags = tags.toLocaleLowerCase();
//                const bmOps = {
//                    [TagModification.add]:
//                        (bm: BookmarkData, modifiedTags: string[]) =>
//                            ({ ...bm, tags: ciDistinct(bm.tags.concat(modifiedTags)) }),
//                    [TagModification.remove]:
//                        (bm: BookmarkData, tagsToRemove: string[]) => {
//                            const shouldKeep = (t: string) => ciTagIndex(t, tagsToRemove) === -1;
//                            return { ...bm, tags: bm.tags.filter(shouldKeep) };
//                        },
//                    [TagModification.set]: (bm: BookmarkData, modifiedTags: string[]) =>
//                        ({ ...bm, tags: ciDistinct(modifiedTags) })
//                }
//                const selectedOp = bmOps[operation];
//                const newTags = tags.split(",");
//                return successTemplate(
//                    keys,
//                    b => selectedOp(b, newTags),
//                    action.response,
//                    actions.ActionType.MODIFY_TAGS,
//                    actions.ActionType.MODIFY_TAGS_SUCCESS,
//                    actions.ActionType.MODIFY_TAGS_FAILURE);
//            }
//        case actions.ActionType.MODIFY_TAGS_FAILURE:
//            {
//                return failureTemplate(
//                    action.payload.keys,
//                    action.error,
//                    actions.ActionType.MODIFY_TAGS,
//                    actions.ActionType.MODIFY_TAGS_FAILURE);
//            }
//        case actions.ActionType.RENAME_TAG_SUCCESS:
//            {
//                const { newTag, oldTag } = action.payload;
//                const keys = Object.keys(state.bookmarks);
//                const requestStates = swapBulkRequestState(
//                    actions.ActionType.RENAME_TAG,
//                    actions.ActionType.RENAME_TAG_SUCCESS);
//                return {
//                    ...state,
//                    requestStates,
//                    bookmarks: modifyBookmarks(keys, state.bookmarks, b => {
//                        const existing = ciTagIndex(oldTag, b.tags);
//                        if (existing === -1) { return b; }
//                        const newTags = [...b.tags];
//                        newTags[existing] = newTag;
//                        return { ...b, tags: newTags };
//                    }),
//                };
//            }
//        case actions.ActionType.RENAME_TAG_FAILURE:
//            {
//                return bulkFailureTemplate(
//                    actions.ActionType.RENAME_TAG,
//                    actions.ActionType.RENAME_TAG_FAILURE);
//            }
//        case actions.ActionType.DELETE_TAG_SUCCESS:
//            {
//                const keys = Object.keys(state.bookmarks);
//                const requestStates = swapBulkRequestState(
//                    actions.ActionType.DELETE_TAG,
//                    actions.ActionType.DELETE_TAG_SUCCESS);
//                return {
//                    ...state,
//                    requestStates,
//                    bookmarks: modifyBookmarks(keys, state.bookmarks, b => {
//                        const existing = ciTagIndex(action.payload.tag, b.tags);
//                        return existing >= 0
//                            ? { ...b, tags: b.tags.filter((_, i) => i !== existing) }
//                            : b;
//                    })
//                };
//            }
//        case actions.ActionType.DELETE_TAG_FAILURE:
//            {
//                return bulkFailureTemplate(
//                    actions.ActionType.DELETE_TAG,
//                    actions.ActionType.DELETE_TAG_FAILURE);
//            }
//        case actions.ActionType.SORT:
//            {
//                const sort = { field: action.field, ascending: action.ascendingOrder };
//                return { ...state, sort };
//            }
//        case actions.ActionType.FILTER_AND_TAGS:
//            return {
//                ...state,
//                filters: {
//                    ...state.filters,
//                    andFilterTags: action.tags
//                }
//            };
//        case actions.ActionType.FILTER_OR_TAGS:
//            return {
//                ...state,
//                filters: {
//                    ...state.filters,
//                    orFilterTags: action.tags
//                }
//            };
//        case actions.ActionType.FILTER_NOT_TAGS:
//            return {
//                ...state,
//                filters: {
//                    ...state.filters,
//                    notFilterTags: action.tags
//                }
//            };
//        default:
//            return state;
//    }
//}
exports.selectBookmarks = (state) => state.bookmarks.bookmarks;
exports.selectBookmark = (state, id) => state.bookmarks.bookmarks[id];
exports.selectBookmarkList = reselect_1.createSelector([exports.selectBookmarks], bookmarks => {
    return Object.keys(bookmarks).map(k => bookmarks[k]);
});
exports.selectBookmarkIds = reselect_1.createSelector([exports.selectBookmarks], bookmarks => {
    return new Set(Object.keys(bookmarks));
});
exports.selectAllTags = reselect_1.createSelector([exports.selectBookmarkList], bookmarks => {
    const tags = new Set();
    bookmarks.forEach(b => {
        b.tags.forEach(t => tags.add(t));
    });
    return tags;
});
// TODO: Change the below selectors to point from the root state instead of relative BookmarkState.
// SOURCE
const selectBookmarkSource = (state) => state.bookmarks.source;
const selectBookmarkPersister = reselect_1.createSelector([selectBookmarkSource], src => {
    if (!src) {
        return bookmark_io_1.noopBookmarkPersister;
    }
    switch (src.type) {
        case BookmarkSourceType.pocket:
            return pocket_api_1.default;
        case BookmarkSourceType.savedJson:
            // TODO: create and change this to a jsonbin persister.
            return bookmark_io_1.noopBookmarkPersister;
        default:
            return bookmark_io_1.noopBookmarkPersister;
    }
});
const selectCapabilities = reselect_1.createSelector([selectBookmarkPersister], persister => (key) => !!persister[key]);
// FILTERS
const selectAndFilter = (state) => state.bookmarks.filters.andFilterTags;
const selectOrFilter = (state) => state.bookmarks.filters.orFilterTags;
const selectNotFilter = (state) => state.bookmarks.filters.notFilterTags;
const selectContentFilter = (state) => state.bookmarks.filters.contentFilter;
const _findMatchingBookmarks = (bookmarks, shouldFilter, filter) => shouldFilter
    ? new Set(bookmarks.filter(filter).map(b => b.id))
    : null;
const selectAndMatchedBookmarkIds = reselect_1.createSelector([exports.selectBookmarkList, selectAndFilter], (bookmarks, andFilter) => {
    return _findMatchingBookmarks(bookmarks, andFilter.length > 0, b => andFilter.every(t => b.tags.includes(t)));
});
const selectOrMatchedBookmarkIds = reselect_1.createSelector([exports.selectBookmarkList, selectOrFilter], (bookmarks, orFilter) => _findMatchingBookmarks(bookmarks, orFilter.length > 0, b => orFilter.some(t => b.tags.includes(t))));
const selectNotMatchedBookmarkIds = reselect_1.createSelector([exports.selectBookmarkList, selectNotFilter], (bookmarks, notFilter) => _findMatchingBookmarks(bookmarks, notFilter.length > 0, b => !notFilter.some(t => b.tags.includes(t))));
const selectContentMatchedBookmarkIds = reselect_1.createSelector([exports.selectBookmarkList, selectContentFilter], (bookmarks, contentFilter) => {
    if (!contentFilter) {
        return null;
    }
    const escapeRegExp = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(escapeRegExp(contentFilter), "i");
    const matchIfExists = (text) => text ? regex.test(text) : false;
    function containsContent(b) {
        const fieldsToSearch = [b.url, b.excerpt, (b.authors || []).join(), b.title];
        return fieldsToSearch.some(matchIfExists);
    }
    return _findMatchingBookmarks(bookmarks, !!contentFilter, containsContent);
});
const selectFilteredBookmarkIds = reselect_1.createSelector([
    exports.selectBookmarkIds,
    selectAndMatchedBookmarkIds,
    selectOrMatchedBookmarkIds,
    selectNotMatchedBookmarkIds,
    selectContentMatchedBookmarkIds,
], (bookmarkIds, andMatches, orMatches, notMatches, contentMatches) => {
    const filterMatches = [andMatches, orMatches, notMatches, contentMatches];
    const matchesForActiveFilters = filterMatches.filter(m => m !== null);
    return matchesForActiveFilters.length
        ? utils_1.SetOps.reduce(matchesForActiveFilters, utils_1.SetOps.intersection)
        : new Set(bookmarkIds);
});
// END FILTERS
// SORTING
const selectSort = (state) => state.bookmarks.sort;
const selectSortedBookmarkIds = reselect_1.createSelector([exports.selectBookmarks, selectFilteredBookmarkIds, selectSort], (bookmarks, filteredKeys, sort) => {
    const orderFactor = sort.ascending ? 1 : -1;
    let cmp = (a, b) => orderFactor * (a < b ? -1 : (a > b ? 1 : 0));
    const regex = RegExp(/^(?:https?|ftp):\/\/www\d*\./i).compile();
    const domain = (url) => url.replace(regex, "");
    const comparisonsByField = {
        "url": (a, b) => cmp(domain(a.url), domain(b.url)),
        "title": (a, b) => cmp(a.title, b.title),
        "date": (a, b) => cmp(a.time_added, b.time_added)
    };
    const compareBookmarksBySelectedField = comparisonsByField[sort.field];
    const sortByBookmarkId = (a, b) => compareBookmarksBySelectedField(bookmarks[a], bookmarks[b]);
    return [...filteredKeys].sort(sortByBookmarkId);
});
// END SORTING
// COMBINED SELECTORS
exports.selectors = {
    selectBookmarkSource, selectBookmarkPersister, selectCapabilities,
    selectBookmarks: exports.selectBookmarks, selectBookmark: exports.selectBookmark, selectAllTags: exports.selectAllTags, selectBookmarkIds: exports.selectBookmarkIds,
    selectAndFilter, selectOrFilter, selectNotFilter, selectContentFilter,
    selectAndMatchedBookmarkIds, selectOrMatchedBookmarkIds, selectNotMatchedBookmarkIds,
    selectContentMatchedBookmarkIds, selectFilteredBookmarkIds, selectSort, selectSortedBookmarkIds
};
// END COMBINED SELECTORS
//# sourceMappingURL=reducer.js.map