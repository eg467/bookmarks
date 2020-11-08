import * as actions from './actions';
import * as pocketActions from '../pocket/bookmarks/actions';
import { createSelector } from 'reselect';
import { SetOps } from '../../utils';
import { BookmarkSortField, BookmarkCollection, BookmarkData } from './bookmarks';
import { BookmarkKeys, BookmarkPersister, TagModification, noopBookmarkPersister } from '../../api/bookmark-io';
import pocketApi from '../../api/pocket-api';
import { Book } from '@material-ui/icons';
import { noop } from 'react-select/src/utils';
import { AppState } from '../root/reducer';

export enum BookmarkSourceType {
    none, pocket, json, savedJson, externalJson, browserBookmarks
}

export interface BookmarkSource {
    type: BookmarkSourceType;
    description: string;
    bookmarkSetIdentifier?: string;
}

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
    },
    source: BookmarkSource;
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
    },
    source: {
        description: "Not loaded",
        type: BookmarkSourceType.none,
    }
};

const toArray = (keys: BookmarkKeys) => Array.isArray(keys) ? keys : [keys];
const modifyBookmarks = (keys: BookmarkKeys, oldBookmarks: BookmarkCollection, modifier: (bookmark: BookmarkData) => BookmarkData) => {
    const bookmarks: BookmarkCollection = { ...oldBookmarks };
    for (let key of toArray(keys)) {
        bookmarks[key] = modifier(bookmarks[key]);
    }
    return bookmarks;
}
const ciCollator = new Intl.Collator("en-US", { sensitivity: "accent" });
const ciCompare = (a: string, b: string) => ciCollator.compare(a, b) === 0;
const ciTagIndex = (q: string, tags: string[]) => tags.findIndex(t => ciCompare(t, q));
const ciDistinct = (items: string[]): string[] => {
    var deduped = [];
    var set = new Set();

    for (let x of items) {
        const key = x.toLocaleUpperCase();
        if (!set.has(key)) {
            set.add(key);
            deduped.push(x);
        }
    }
    return deduped;
}

export default function (state: BookmarkState = initialState, action: actions.BookmarkAction | pocketActions.PocketBookmarksAction): BookmarkState {
    switch (action.type) {
        case pocketActions.ActionType.FETCH_BOOKMARKS_SUCCESS:
            const { bookmarks, source } = action.response;
            return { ...state, bookmarks, source };

        case actions.ActionType.SHOW:
            return { ...state, bookmarks: action.bookmarks };

        case actions.ActionType.REMOVE_SUCCESS:
            {
                const bookmarks: BookmarkCollection = {
                    ...state.bookmarks,
                };

                for (let id of toArray(action.payload.keys)) {
                    delete bookmarks[id];
                }

                return { ...state, bookmarks };
            }
        case actions.ActionType.ARCHIVE_SUCCESS:
            {
                const { keys, status } = action.payload;
                const bookmarks = modifyBookmarks(keys, state.bookmarks, b => ({ ...b, archive: status }));
                return { ...state, bookmarks };
            }
        case actions.ActionType.FAVORITE_SUCCESS:
            {
                const { keys, status } = action.payload;
                const bookmarks = modifyBookmarks(keys, state.bookmarks, b => ({ ...b, favorite: status }));
                return { ...state, bookmarks };
            }
        case actions.ActionType.MODIFY_TAGS_SUCCESS:
            {
                const { keys, operation, tags } = action.payload;

                const bmOps = {
                    [TagModification.add]:
                        (bm: BookmarkData, modifiedTags: string[]) =>
                            ({ ...bm, tags: ciDistinct(bm.tags.concat(modifiedTags)) }),
                    [TagModification.remove]:
                        (bm: BookmarkData, modifiedTags: string[]) => {
                            const { tags: oldTags } = bm;
                            const shouldKeep = (t: string) => ciTagIndex(t, modifiedTags) === -1;
                            return { ...bm, tags: oldTags.filter(shouldKeep) };
                        },
                    [TagModification.set]: (bm: BookmarkData, modifiedTags: string[]) =>
                        ({ ...bm, tags: ciDistinct(modifiedTags) })
                }

                const selectedOp = bmOps[operation];
                const newTags = tags.split(",");

                const bookmarks = modifyBookmarks(keys, state.bookmarks, b => selectedOp(b, newTags));
                return { ...state, bookmarks };
            }
        case actions.ActionType.RENAME_TAG_SUCCESS:
            {
                const { newTag, oldTag } = action.payload;

                const bookmarks = modifyBookmarks(
                    Object.keys(state.bookmarks),
                    state.bookmarks,
                    b => {
                        const existing = ciTagIndex(oldTag, b.tags);
                        if (existing === -1) { return b; }

                        const newTags = [...b.tags];
                        newTags[existing] = newTag;
                        return { ...b, tags: newTags };
                    }
                );

                return { ...state, bookmarks };
            }

        case actions.ActionType.DELETE_TAG_SUCCESS:
            {
                const { tag } = action.payload;

                const bookmarks = modifyBookmarks(
                    Object.keys(state.bookmarks),
                    state.bookmarks,
                    b => {
                        const existing = ciTagIndex(tag, b.tags);
                        return existing >= 0
                            ? { ...b, tags: b.tags.filter((_, i) => i !== existing) }
                            : b;
                    }
                );

                return { ...state, bookmarks };
            }

        case actions.ActionType.SORT:
            {
                const sort = { field: action.field, ascending: action.ascendingOrder };
                return { ...state, sort };
            }

        case actions.ActionType.FILTER_AND_TAGS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    andFilterTags: action.tags
                }
            };

        case actions.ActionType.FILTER_OR_TAGS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    orFilterTags: action.tags
                }
            };

        case actions.ActionType.FILTER_NOT_TAGS:
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

export const selectBookmarks = (state: AppState) => state.bookmarks.bookmarks;
export const selectBookmark = (state: AppState, id: string) => state.bookmarks.bookmarks[id];

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

// TODO: Change the below selectors to point from the root state instead of relative BookmarkState.

// SOURCE

const selectBookmarkSource = (state: AppState) => state.bookmarks.source;
const selectBookmarkPersister = createSelector([selectBookmarkSource], src => {
    if (!src) {
        return noopBookmarkPersister as BookmarkPersister;
    }

    switch (src.type) {
        case BookmarkSourceType.pocket:
            return pocketApi as BookmarkPersister;
        case BookmarkSourceType.savedJson:
            // TODO: create and change this to a jsonbin persister.
            return noopBookmarkPersister as BookmarkPersister;

        default:
            return noopBookmarkPersister as BookmarkPersister;
    }
});

// FILTERS

const selectAndFilter = (state: AppState) => state.bookmarks.filters.andFilterTags;
const selectOrFilter = (state: AppState) => state.bookmarks.filters.orFilterTags;
const selectNotFilter = (state: AppState) => state.bookmarks.filters.notFilterTags;
const selectContentFilter = (state: AppState) => state.bookmarks.filters.contentFilter;

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

const selectSort = (state: AppState) => state.bookmarks.sort;

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

export const selectors = {
    selectBookmarkSource, selectBookmarkPersister,
    selectBookmarks, selectBookmark, selectAllTags, selectBookmarkIds,
    selectAndFilter, selectOrFilter, selectNotFilter, selectContentFilter,
    selectAndMatchedBookmarkIds, selectOrMatchedBookmarkIds, selectNotMatchedBookmarkIds,
    selectContentMatchedBookmarkIds, selectFilteredBookmarkIds, selectSort, selectSortedBookmarkIds
}

// END COMBINED SELECTORS