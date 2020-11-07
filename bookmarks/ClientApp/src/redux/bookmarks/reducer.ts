import * as actions from './actions';
import * as pocketActions from '../pocket/bookmarks/actions';
import { createSelector } from 'reselect';
import { SetOps } from '../../utils';
import { BookmarkSortField, BookmarkCollection, BookmarkData } from './bookmarks';

export interface BookmarkState {
    bookmarks: BookmarkCollection;
    sort: {
        field: BookmarkSortField,
        ascending: boolean
    },
    filters: {
        /** Matching bookmarks must include all these tags.  */
        andFilterTags: string[];
        /** Matching bookmarks must include at least one of these tags.  */
        orFilterTags: string[];
        /** Matching bookmarks must not include any of these tags.  */
        notFilterTags: string[];
        /** Matching bookmarks must this in the title, domain, excerpt, etc. */
        contentFilter: string;
    }
}

export const initialState: BookmarkState = {
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
    }
};

export default function (state: BookmarkState = initialState, action: actions.BookmarkAction | pocketActions.PocketBookmarksAction): BookmarkState {
    switch (action.type) {
        case pocketActions.ActionType.FETCH_BOOKMARKS_SUCCESS:
            return { ...state, bookmarks: action.response.bookmarks }

        case actions.ActionType.SHOW_BOOKMARKS:
            return { ...state, bookmarks: action.bookmarks };

        case actions.ActionType.SORT_BOOKMARKS:
            const sort = { field: action.field, ascending: action.ascendingOrder };
            return { ...state, sort };

        case actions.ActionType.SET_AND_TAGS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    andFilterTags: action.tags
                }
            };

        case actions.ActionType.SET_OR_TAGS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    orFilterTags: action.tags
                }
            };

        case actions.ActionType.SET_NOT_TAGS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    notFilterTags: action.tags
                }
            };

        default:
            return state;
    }
}

export const selectBookmarks = (state: BookmarkState) => state.bookmarks;
export const selectBookmark = (state: BookmarkState, id: string) => state.bookmarks[id];

export const selectBookmarkList = createSelector([selectBookmarks], bookmarks => {
    return Object.keys(bookmarks).map(k => bookmarks[k])
});

export const selectBookmarkIds = createSelector([selectBookmarks], bookmarks => {
    return new Set(Object.keys(bookmarks))
});

export const selectAllTags = createSelector([selectBookmarkList], bookmarks => {
    const tags = new Set();
    bookmarks.forEach(b => {
        b.tags.forEach(t => tags.add(t));
    });
    return tags;
});

// FILTERS

const selectAndFilter = (state: BookmarkState) => state.filters.andFilterTags;
const selectOrFilter = (state: BookmarkState) => state.filters.orFilterTags;
const selectNotFilter = (state: BookmarkState) => state.filters.notFilterTags;
const selectContentFilter = (state: BookmarkState) => state.filters.contentFilter;

const _findMatchingBookmarks = (bookmarks: BookmarkData[], shouldFilter: boolean, filter: (b: BookmarkData) => boolean) =>
    shouldFilter
        ? new Set(bookmarks.filter(filter).map(b => b.id)) as ReadonlySet<string>
        : null;

const selectAndMatchedBookmarkIds = createSelector(
    [selectBookmarkList, selectAndFilter],
    (bookmarks, andFilter) => {
        return _findMatchingBookmarks(bookmarks, andFilter.length > 0, b => andFilter.every(t => b.tags.includes(t)));
    }
);

const selectOrMatchedBookmarkIds = createSelector(
    [selectBookmarkList, selectOrFilter],
    (bookmarks, orFilter) =>
        _findMatchingBookmarks(bookmarks, orFilter.length > 0, b => orFilter.some(t => b.tags.includes(t)))
);

const selectNotMatchedBookmarkIds = createSelector(
    [selectBookmarkList, selectNotFilter],
    (bookmarks, notFilter) =>
        _findMatchingBookmarks(bookmarks, notFilter.length > 0, b => !notFilter.some(t => b.tags.includes(t)))
);

const selectContentMatchedBookmarkIds = createSelector(
    [selectBookmarkList, selectContentFilter],
    (bookmarks, contentFilter) => {
        if (!contentFilter) {
            return null;
        }

        const escapeRegExp = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const regex = new RegExp(escapeRegExp(contentFilter), "i");
        const matchIfExists = (text: string | null | undefined) => text ? regex.test(text) : false;

        function containsContent(b: BookmarkData) {
            const fieldsToSearch = [b.url, b.excerpt, (b.authors || []).join(), b.title];
            return fieldsToSearch.some(matchIfExists);
        }

        return _findMatchingBookmarks(bookmarks, !!contentFilter, containsContent);
    }
);

const selectFilteredBookmarkIds = createSelector([
    selectBookmarkIds,
    selectAndMatchedBookmarkIds,
    selectOrMatchedBookmarkIds,
    selectNotMatchedBookmarkIds,
    selectContentMatchedBookmarkIds,
], (bookmarkIds, andMatches, orMatches, notMatches, contentMatches) => {
    const filterMatches = [andMatches, orMatches, notMatches, contentMatches];
    const matchesForActiveFilters = filterMatches.filter(m => m !== null) as Set<string>[];

    return matchesForActiveFilters.length
        ? SetOps.reduce(matchesForActiveFilters, SetOps.intersection)
        : new Set(bookmarkIds);
});

// END FILTERS

// SORTING

const selectSort = (state: BookmarkState) => state.sort;

const selectSortedBookmarkIds = createSelector(
    [selectBookmarks, selectFilteredBookmarkIds, selectSort],
    (bookmarks, filteredKeys, sort) => {
        const orderFactor = sort.ascending ? 1 : -1;
        let cmp = <T>(a: T, b: T): number => orderFactor * (a < b ? -1 : (a > b ? 1 : 0));

        const regex = RegExp(/^(?:https?|ftp):\/\/www\d*\./i).compile();

        const domain = (url: string) => url.replace(regex, "")
        const comparisonsByField: { [field in BookmarkSortField]: (a: BookmarkData, b: BookmarkData) => number } = {
            "url": (a, b) => cmp(domain(a.url), domain(b.url)),
            "title": (a, b) => cmp(a.title, b.title),
            "date": (a, b) => cmp(a.time_added, b.time_added)
        };

        const compareBookmarksBySelectedField = comparisonsByField[sort.field];
        const sortByBookmarkId = (a: string, b: string) => compareBookmarksBySelectedField(bookmarks[a], bookmarks[b]);

        return [...filteredKeys].sort(sortByBookmarkId);
    });

// END SORTING

// COMBINED SELECTORS

export const bookmarkSelectors = {
    selectBookmarks, selectBookmark, selectAllTags, selectBookmarkIds,
    selectAndFilter, selectOrFilter, selectNotFilter, selectContentFilter,
    selectAndMatchedBookmarkIds, selectOrMatchedBookmarkIds, selectNotMatchedBookmarkIds,
    selectContentMatchedBookmarkIds, selectFilteredBookmarkIds, selectSort, selectSortedBookmarkIds,
}

// END COMBINED SELECTORS