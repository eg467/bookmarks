import * as actions from './actions';
import * as pocketActions from '../pocket/bookmarks/actions';
import { createSelector } from 'reselect';
import { SetOps } from '../../utils';
import { BookmarkSortField, BookmarkCollection, BookmarkData } from './bookmarks';
import { BookmarkKeys, BookmarkPersister, TagModification, noopBookmarkPersister, toArray } from '../../api/bookmark-io';
import pocketApi from '../../api/pocket-api';
import { AutorenewTwoTone, Book } from '@material-ui/icons';
import { noop } from 'react-select/src/utils';
import { AppState } from '../root/reducer';
import { RequestState, RequestStatesState, RequestType, StateByRequest } from '../request-states/reducer';
import produce from 'immer';

export enum BookmarkSourceType {
    none, pocket, json, savedJson, externalJson, browserBookmarks
}

export interface BookmarkSource {
    type: BookmarkSourceType;
    description: string;
    bookmarkSetIdentifier?: string;
}

// TODO: Split these reducers.
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
    requestStates: RequestStatesState;
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
const ciCompare = (a: string, b: string) => ciCollator.compare(a, b) === 0;
const ciTagIndex = (q: string, tags: string[]) => tags.findIndex(t => ciCompare(t, q));
//const ciDistinct = (items: string[]): string[] => {
//    var deduped = [];
//    var set = new Set();

//    for (let x of items) {
//        const key = x.toLocaleUpperCase();
//        if (!set.has(key)) {
//            set.add(key);
//            deduped.push(x);
//        }
//    }
//    return deduped;
//}

export interface PersistanceResult {
    /**
     * True if no change was persisted to any store, but the UI should update to reflect the change.
     * */
    dirtyChange: boolean;
}

export interface FailedIndividualRequest {
    id?: string;
    error: string;
}

export interface PartialSuccessResult extends PersistanceResult {
    successfulIds: string[];
    failureIds: FailedIndividualRequest[];
}

export const createDirtyPartialSuccessResult = (keys: BookmarkKeys): PartialSuccessResult => {
    return { dirtyChange: true, successfulIds: toArray(keys), failureIds: [] }
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

export const standardizeTags = (tags: string[]) => tags.map(t => t.toLowerCase());

const reducer = produce(
    (state: BookmarkState, action: actions.BookmarkAction | pocketActions.PocketBookmarksAction) => {
        function applyToIds(results: PartialSuccessResult, transform: (bm: BookmarkData, id: string) => void) {
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
                            case TagModification.add:
                                b.tags = [... new Set([...b.tags, ...modifiedTags])];
                                break;
                            case TagModification.remove:
                                const keysToRemove = new Set(modifiedTags);
                                b.tags = b.tags.filter(t => !keysToRemove.has(t));
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
                    state.sort = { field, ascending }
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

const selectCapabilities = createSelector(
    [selectBookmarkPersister],
    persister => (key: Exclude<keyof BookmarkPersister, "sourceType">) => !!persister[key]
);

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
    selectBookmarkSource, selectBookmarkPersister, selectCapabilities,
    selectBookmarks, selectBookmark, selectAllTags, selectBookmarkIds,
    selectAndFilter, selectOrFilter, selectNotFilter, selectContentFilter,
    selectAndMatchedBookmarkIds, selectOrMatchedBookmarkIds, selectNotMatchedBookmarkIds,
    selectContentMatchedBookmarkIds, selectFilteredBookmarkIds, selectSort, selectSortedBookmarkIds
}

// END COMBINED SELECTORS