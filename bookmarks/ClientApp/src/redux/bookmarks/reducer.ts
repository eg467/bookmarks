import * as actions from "./actions";
import {PocketAction,ActionType as pocketActionType} from "../pocket/actions";
import { createSelector } from "reselect";
import {SetOps, ciEquals, deduplicate, removeNulls, ciCollator, getHostName, newId} from "../../utils";
import {
   BookmarkSortField,
   BookmarkCollection,
   BookmarkData,
} from "./bookmarks";
import {
   BookmarkKeys,
   BookmarkPersister,
   TagModification,
   toArray,
} from "../../api/bookmark-io";
import pocketApi from "../../api/pocket-api";
import { AppState } from "../root/reducer";
import {RequestStatesState} from "../request-states/reducer";
import produce from "immer";
import {InMemoryBookmarkPersister} from "../../api/InMemoryBookmarkPersister";
import {FirebasePersister} from "../../api/firebase/firebase";
import {createLocalBookmarkPersister} from "../../api/LocalStoragePersister";

export enum BookmarkSourceType {
   /**
    * There is no data from no source
    */
   none,
   /*
    * Data comes from an authenticated getpocket.com account.
    */
   pocket,
   /*
    * Imported from read-only json source, e.g. from a textbox or querystring
    */
   readonlyJson,
   /*
    * Json loaded from a source (e.g. jsonbin or myjson) owned or created by the user.
    */
   savedJson,
   /*
    * Json loaded from a source (e.g. jsonbin or myjson) owned or created by a different user.
    */
   externalJson,
   /*
    * Json loaded from a user's bookmarks.
    */
   browserBookmarks,
   /*
    * Stored using browser local storage API.
    */
   local,
   ownedFirebase,
   readonlyFirebase,
}
 
export enum SourceTrustLevel {
   untrusted, ignoredUntrusted, trusted
}

export type BookmarkSource = {
   type: BookmarkSourceType;
   description: string;
   bookmarkSetId?: string;
   trusted: SourceTrustLevel;
}

export const createBookmarkSource = (
   type: BookmarkSourceType, 
   trusted?: boolean,
   description?: string,
   bookmarkSetIdentifier?: string
): BookmarkSource => ({
   type,
   trusted: trusted ? SourceTrustLevel.trusted : SourceTrustLevel.untrusted,
   description: description || BookmarkSourceType[type],
   bookmarkSetId: bookmarkSetIdentifier 
});

export type SourcedBookmarks = {
   bookmarks: BookmarkCollection;
   source: BookmarkSource;
};

// TODO: Split these reducers.
export type BookmarkState = SourcedBookmarks & {
   sort: {
      field: BookmarkSortField;
      ascending: boolean;
   };
   selected: {
      [key: string]: boolean
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
      /** Matching bookmarks must be: true: archived, false: archived, undefined: either. */
      archived?: boolean;
      /** Matching bookmarks must be: true: favorite, false: not a favorite, undefined: either. */
      favorite?: boolean;
      /** Matching bookmarks must be: true: selected, false: unselected, undefined: either. */
      selected?: boolean;
   };
   requestStates: RequestStatesState;
}

export const initialState: BookmarkState = {
   bookmarks: {},
   sort: {
      field: BookmarkSortField.url,
      ascending: true,
   },
   selected: {},
   filters: {
      andFilterTags: [],
      notFilterTags: [],
      orFilterTags: [],
      contentFilter: ""
   },
   source: {
      description: "Not loaded",
      type: BookmarkSourceType.none,
      trusted: SourceTrustLevel.untrusted
   },
   requestStates: {
      bulkRequests: {},
      byBookmark: {},
   },
};

export const ciIndexOf = (q: string, values: string[]) =>
   values.findIndex((v) => ciEquals(v, q));

export interface PersistenceResult {
   /**
    * True if no change was persisted to any store, but the UI should update to reflect the change.
    * */
   dirtyChange: boolean;
}

export type FailedIndividualRequest = {
   id?: string;
   error: string;
}

export type PartialSuccessResult = PersistenceResult & {
   successfulIds: Nullable<string>[];
   failureIds: Nullable<FailedIndividualRequest>[];
}

export const createPartialSuccessResult = (dirtyChange: boolean, count?: number): PartialSuccessResult => ({
   dirtyChange,
   failureIds: count ? [...new Array(count)].map(() => null) : [],
   successfulIds: count ? [...new Array(count)].map(() => null) : [],
});

export const standardizeTags = (tags: OneOrMany<string>) => {
   if(typeof(tags) === "string") {
      tags = tags.split(",")
   }
   return deduplicate(
      tags.map(
         t => t.toLocaleLowerCase()
            .trim()
            .replace(/,+/g, "."))
         .filter(x => x)
   );
};

export const standardizeTag = (tag: string) => {
   const tags = standardizeTags([tag]);
   if(!tags.length) {
      throw Error("Invalid tag specified.")
   }
   return tags[0];
}
   

const reducer = produce(
   (
      state: BookmarkState,
      action: actions.BookmarkAction | PocketAction,
   ) => {
      const transformAffectedBookmarks = (
         results: PartialSuccessResult,
         transform: (bm: BookmarkData, id: string) => void,
      ) => {
         removeNulls(results.successfulIds)
            .filter(id => !!state.bookmarks[id])
            .forEach((id) =>
               
            transform(state.bookmarks[id], id),
         );
      }

      switch (action.type) {
         case pocketActionType.FETCH_BOOKMARKS_SUCCESS: {
            const { bookmarks, source } = action.response;
            state.bookmarks = bookmarks;
            state.source = source;
            break;
         }

         case pocketActionType.LOGOUT: {
            state = initialState;
            break;
         }

         case actions.ActionType.LOAD: {
            const { bookmarks, source } = action.sourcedBookmarks;
            state.bookmarks = bookmarks;
            state.source = source;
            break;
         }

         case actions.ActionType.ADD_SUCCESS: {
            action.response.addedBookmarks.forEach(b => {
               state.bookmarks[b.id] = b;
            });
            break;
         }

         case actions.ActionType.REMOVE_SUCCESS: {
            transformAffectedBookmarks(action.response, (_, id) => delete state.bookmarks[id]);
            break;
         }

         case actions.ActionType.ARCHIVE_SUCCESS: {
            transformAffectedBookmarks(
               action.response,
               (b) => (b.archive = action.payload.status),
            );
            break;
         }

         case actions.ActionType.FAVORITE_SUCCESS: {
            transformAffectedBookmarks(
               action.response,
               (b) => (b.favorite = action.payload.status),
            );
            break;
         }

         case actions.ActionType.MODIFY_TAGS_SUCCESS: {
            const { operation, tags } = action.payload;

            // TODO: standardize tags in one place.
            const modifiedTags = tags.toLocaleLowerCase().split(",");
            transformAffectedBookmarks(action.response, (b) => {
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
               const io = ciIndexOf(oldTag, b.tags);
               if (io >= 0) {
                  b.tags[io] = newTag;
               }
            }
            break;

         case actions.ActionType.DELETE_TAG_SUCCESS:
            const { tag } = action.payload;
            for (const b of Object.values(state.bookmarks)) {
               const io = ciIndexOf(tag, b.tags);
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

         case actions.ActionType.FILTER_ARCHIVE:
            state.filters.archived = action.archived;
            break;

         case actions.ActionType.FILTER_FAVORITE:
            state.filters.favorite = action.favorite;
            break;

         case actions.ActionType.FILTER_SELECTED:
            state.filters.selected = action.selected;
            break;
            
         case actions.ActionType.CLEAR_FILTERS:
            state.filters = initialState.filters;
            break;
            
         case actions.ActionType.SELECT:
            let {bookmarkIds, selected} = action;
            
            // If no bookmarks were passed, apply to every bookmark
            if(bookmarkIds === undefined) {
               bookmarkIds = Object.keys(state.bookmarks);
            }
            
            const ids = toArray(bookmarkIds);
            if(selected) {
               ids.forEach(k => state.selected[k] = true);
            } else {
               ids.forEach(id => delete state.selected[id]);   
            }
      }
   },
   initialState,
);

export default reducer;

export const selectBookmarks = (state: AppState) => state.bookmarks.bookmarks;
export const selectBookmark = (state: AppState, id: string) =>
   state.bookmarks.bookmarks[id];

export const selectBookmarkList = createSelector(
   [selectBookmarks],
   (bookmarks) => {
      return Object.keys(bookmarks).map((k) => bookmarks[k]);
   },
);

export const selectBookmarkIds = createSelector(
   [selectBookmarks],
   (bookmarks) => {
      return new Set(Object.keys(bookmarks));
   },
);

export const selectAllTags = createSelector(
   [selectBookmarkList],
   (bookmarks) => {
      const tags = new Set<string>();
      bookmarks.forEach((b) => {
         b.tags.forEach((t) => tags.add(t));
      });
      return [...tags].sort();
   },
);

// TODO: Change the below selectors to point from the root state instead of relative BookmarkState.

// SOURCE
const selectBookmarkSource = (state: AppState) => state.bookmarks.source;
const selectAreBookmarksLoaded = (state: AppState) => selectBookmarkSource(state).type !== BookmarkSourceType.none;

const selectBookmarkPersister = createSelector(
   [selectBookmarkSource, selectBookmarks],
   (src, currentBookmarks): BookmarkPersister => {
      const safeSetId = () => {
         if(!src.bookmarkSetId) {
            throw Error("No bookmark set selected.");
         }
         return src.bookmarkSetId;
      }
      switch (src.type) {
         case BookmarkSourceType.pocket:
            return pocketApi;
         case BookmarkSourceType.ownedFirebase:
            return new FirebasePersister(safeSetId(), currentBookmarks);
         case BookmarkSourceType.readonlyFirebase:
            return new InMemoryBookmarkPersister(currentBookmarks, BookmarkSourceType.readonlyFirebase, newId);
         case BookmarkSourceType.local:
            return createLocalBookmarkPersister(safeSetId(), currentBookmarks);
         default:
            return new InMemoryBookmarkPersister(currentBookmarks);
      }
   },
);

export type CapabilityQuery = (key: Exclude<keyof BookmarkPersister, "sourceType">) => boolean;
const selectCapabilities = createSelector(
   [selectBookmarkPersister],
   (persister) => ((key: Exclude<keyof BookmarkPersister, "sourceType">) =>
      !!persister[key]) as CapabilityQuery,
);

// FILTERS

const selectAndFilter = (state: AppState): string[] =>
   state.bookmarks.filters.andFilterTags;
const selectOrFilter = (state: AppState): string[] =>
   state.bookmarks.filters.orFilterTags;
const selectNotFilter = (state: AppState): string[] =>
   state.bookmarks.filters.notFilterTags;
const selectContentFilter = (state: AppState): string =>
   state.bookmarks.filters.contentFilter;
const selectArchiveFilter = (state: AppState): boolean|undefined =>
    state.bookmarks.filters.archived;
const selectFavoriteFilter = (state: AppState): boolean|undefined =>
    state.bookmarks.filters.favorite;

/**
 * Finds a set containing the matching bookmark ids if the filter is active. 
 * @param bookmarks
 * @param shouldFilter
 * @param filter
 */
const _findMatchingBookmarks = (
   bookmarks: BookmarkData[],
   shouldFilter: boolean,
   filter: (b: BookmarkData) => boolean,
) => {
   const findIds = () => bookmarks
      .filter(filter)
      .map((b) => b.id)
   return shouldFilter ? new Set(findIds()) : null;
}
   

const selectAndMatchedBookmarkIds = createSelector(
   [selectBookmarkList, selectAndFilter],
   (bookmarks, andFilter) => {
      return _findMatchingBookmarks(bookmarks, andFilter.length > 0, (b) =>
         andFilter.every((t) => b.tags.includes(t)),
      );
   },
);

const selectOrMatchedBookmarkIds = createSelector(
   [selectBookmarkList, selectOrFilter],
   (bookmarks, orFilter) =>
      _findMatchingBookmarks(bookmarks, orFilter.length > 0, (b) =>
         orFilter.some((t) => b.tags.includes(t)),
      ),
);

const selectNotMatchedBookmarkIds = createSelector(
   [selectBookmarkList, selectNotFilter],
   (bookmarks, notFilter) =>
      _findMatchingBookmarks(
         bookmarks,
         notFilter.length > 0,
         (b) => !notFilter.some((t) => b.tags.includes(t)),
      ),
);

const selectContentMatchedBookmarkIds = createSelector(
   [selectBookmarkList, selectContentFilter],
   (bookmarks, contentFilter) => {
      if (!contentFilter) {
         return null;
      }

      const escapeRegExp = (text: string) =>
         text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const regex = new RegExp(escapeRegExp(contentFilter), "i");
      const matchIfExists = (text: string | null | undefined) =>
         text ? regex.test(text) : false;

      function containsContent(b: BookmarkData) {
         const fieldsToSearch = [
            b.url,
            b.excerpt,
            (b.authors || []).join(),
            b.title,
         ];
         return fieldsToSearch.some(matchIfExists);
      }

      return _findMatchingBookmarks(
         bookmarks,
         !!contentFilter,
         containsContent,
      );
   },
);

const selectSelectedBookmarks = (state:AppState): {[key: string]: boolean} => state.bookmarks.selected;
// noinspection PointlessBooleanExpressionJS
const selectBookmarkSelection = (state:AppState, bookmarkId: string): boolean => !!selectSelectedBookmarks(state)[bookmarkId];
const selectBookmarkSelectionFilter = (state:AppState): boolean | undefined  => state.bookmarks.filters.selected;
const selectSelectedBookmarkIds = createSelector(
   [selectSelectedBookmarks],
   (selectedBookmarks) => new Set(Object.keys(selectedBookmarks))
);

const selectArchiveMatchedBookmarkIds = createSelector(
    [selectBookmarkList, selectArchiveFilter],
    (bookmarks, archiveFilter) =>
        _findMatchingBookmarks(
            bookmarks,
            typeof archiveFilter !== "undefined",
            (b) => !b.archive === !archiveFilter,
        ),
);

const selectFavoriteMatchedBookmarkIds = createSelector(
    [selectBookmarkList, selectFavoriteFilter],
    (bookmarks, favoriteFilter) =>
        _findMatchingBookmarks(
            bookmarks,
            typeof favoriteFilter !== "undefined",
            (b) => !b.favorite === !favoriteFilter,
        ),
);

// '!!' Needed to compare undefined vs T/F.
// noinspection PointlessBooleanExpressionJS
const selectSelectedMatchedBookmarkIds = createSelector(
   [selectBookmarkList, selectSelectedBookmarks, selectBookmarkSelectionFilter],
   (bookmarks, selectedBookmarks, selectionFilter) =>
      _findMatchingBookmarks(
         bookmarks,
         typeof selectionFilter !== "undefined",
         (b) => !!selectedBookmarks[b.id] === selectionFilter,
      ),
);
   
const selectFilteredBookmarkIds = createSelector(
   [
      selectBookmarkIds,
      selectAndMatchedBookmarkIds,
      selectOrMatchedBookmarkIds,
      selectNotMatchedBookmarkIds,
      selectContentMatchedBookmarkIds,
      selectArchiveMatchedBookmarkIds,
      selectFavoriteMatchedBookmarkIds,
      selectSelectedMatchedBookmarkIds
   ],
   (
       bookmarkIds, 
       andMatches, 
       orMatches, 
       notMatches,
       contentMatches,
       archiveMatches,
       favoriteMatches,
       sectionMatches
   ) => {
      const filterMatches = [andMatches, orMatches, notMatches, contentMatches, archiveMatches, favoriteMatches, sectionMatches];
      const matchesForActiveFilters = filterMatches.filter(
         (m) => m !== null,
      ) as Set<string>[];

      return matchesForActiveFilters.length
         ? SetOps.reduce(matchesForActiveFilters, SetOps.intersection)
         : new Set(bookmarkIds);
   },
);

// END FILTERS

// SORTING

const selectSort = (state: AppState) => state.bookmarks.sort;

type BookmarkComparer = (a: BookmarkData, b: BookmarkData) => number;

const selectSortedBookmarkIds = createSelector(
   [selectBookmarks, selectFilteredBookmarkIds, selectSort],
   (bookmarks, filteredKeys, sort) => {
      const order = (comparison: number) => sort.ascending ? comparison : -comparison;
      const cmp = <T>(a: T, b: T): number => order(a < b ? -1 : a > b ? 1 : 0);
      const ciCompare = (a: string, b: string): number => order(ciCollator.compare(a,b)); 
        
      const comparisonsByField: {
         [field in BookmarkSortField]: BookmarkComparer;
      } = {
         [BookmarkSortField.url]: (a, b) => ciCompare(getHostName(a.url) || "", getHostName(b.url) || ""),
         [BookmarkSortField.title]: (a, b) => ciCompare(a.title, b.title),
         [BookmarkSortField.date]: (a, b) => cmp(a.time_added, b.time_added),
      };

      const compareBookmarksBySelectedField = comparisonsByField[sort.field];
      const sortByBookmarkId = (a: string, b: string) =>
         compareBookmarksBySelectedField(bookmarks[a], bookmarks[b]);

      return [...filteredKeys].sort(sortByBookmarkId);
   },
);

// END SORTING



// COMBINED SELECTORS

export const selectors = {
   selectBookmarkSource,
   selectAreBookmarksLoaded,
   selectBookmarkPersister,
   selectCapabilities,
   selectBookmarks,
   selectBookmarkList,
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
   selectSelectedBookmarks,
   selectBookmarkSelection,
   selectSelectedBookmarkIds
};

// END COMBINED SELECTORS
