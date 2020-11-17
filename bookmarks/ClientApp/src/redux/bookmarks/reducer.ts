import * as actions from "./actions";
import * as pocketActions from "../pocket/bookmarks/actions";
import { createSelector } from "reselect";
import { SetOps } from "../../utils";
import {
   BookmarkSortField,
   BookmarkCollection,
   BookmarkData,
} from "./bookmarks";
import {
   BookmarkKeys,
   BookmarkPersister,
   TagModification,
   noopBookmarkPersister,
   toArray,
} from "../../api/bookmark-io";
import pocketApi from "../../api/pocket-api";
import { AppState } from "../root/reducer";
import { RequestStatesState } from "../request-states/reducer";
import produce from "immer";

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
   json,
   /*
    * Json loaded from a source (e.g. jsonbin or myjson) owned or created by the user.
    */
   savedJson,
   /*
    * Json loaded from a source (e.g. jsonbin or myjson) owned or created by a different user.
    */
   externalJson,
   /*
    * Json loaded from a user's bookmarks
    */
   browserBookmarks,
}

export enum SourceTrustLevel {
   trusted, untrusted, warnedUntrusted
}

export interface BookmarkSource {
   type: BookmarkSourceType;
   description: string;
   bookmarkSetIdentifier?: string;
   trusted: SourceTrustLevel;
}

// TODO: Split these reducers.
export interface BookmarkState {
   bookmarks: BookmarkCollection;
   sort: {
      field: BookmarkSortField;
      ascending: boolean;
   };
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
   };
   source: BookmarkSource;
   requestStates: RequestStatesState;
}

export const initialState: BookmarkState = {
   bookmarks: {},
   sort: {
      field: BookmarkSortField.url,
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
      trusted: SourceTrustLevel.untrusted
   },
   requestStates: {
      bulkRequests: {},
      byBookmark: {},
   },
};

const ciCollator = new Intl.Collator("en-US", { sensitivity: "accent" });
const ciCompare = (a: string, b: string) => ciCollator.compare(a, b) === 0;
const ciTagIndex = (q: string, tags: string[]) =>
   tags.findIndex((t) => ciCompare(t, q));

export interface PersistenceResult {
   /**
    * True if no change was persisted to any store, but the UI should update to reflect the change.
    * */
   dirtyChange: boolean;
}

export interface FailedIndividualRequest {
   id?: string;
   error: string;
}

export interface PartialSuccessResult extends PersistenceResult {
   successfulIds: string[];
   failureIds: FailedIndividualRequest[];
}

export const createDirtyPartialSuccessResult = (
   keys: BookmarkKeys,
): PartialSuccessResult => {
   return { dirtyChange: true, successfulIds: toArray(keys), failureIds: [] };
};

export const standardizeTags = (tags: string[]) =>
   tags.map((t) => t.toLowerCase().replace(/,+/g, "_"));

const reducer = produce(
   (
      state: BookmarkState,
      action: actions.BookmarkAction | pocketActions.PocketBookmarksAction,
   ) => {
      const transformAffectedBookmarks = (
         results: PartialSuccessResult,
         transform: (bm: BookmarkData, id: string) => void,
      ) =>
         results.successfulIds.forEach((id) =>
            transform(state.bookmarks[id], id),
         );

      switch (action.type) {
         case actions.ActionType.LOAD: {
            const { bookmarks, source } = action;
            state.bookmarks = bookmarks;
            state.source = source;
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

         case actions.ActionType.FILTER_ARCHIVE:
            state.filters.archived = action.archived;
            break;

         case actions.ActionType.FILTER_FAVORITE:
            state.filters.favorite = action.favorite;
            break;
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
const selectBookmarkPersister = createSelector(
   [selectBookmarkSource],
   (src) => {
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
   },
);

const selectCapabilities = createSelector(
   [selectBookmarkPersister],
   (persister) => (key: Exclude<keyof BookmarkPersister, "sourceType">) =>
      !!persister[key],
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

const _findMatchingBookmarks = (
   bookmarks: BookmarkData[],
   shouldFilter: boolean,
   filter: (b: BookmarkData) => boolean,
) =>
   shouldFilter
      ? (new Set(bookmarks.filter(filter).map((b) => b.id)) as ReadonlySet<
           string
        >)
      : null;

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

const selectArchiveMatchedBookmarkIds = createSelector(
    [selectBookmarkList, selectArchiveFilter],
    (bookmarks, archiveFilter) =>
        _findMatchingBookmarks(
            bookmarks,
            typeof archiveFilter !== "undefined",
            (b) => b.archive === archiveFilter,
        ),
);

const selectFavoriteMatchedBookmarkIds = createSelector(
    [selectBookmarkList, selectFavoriteFilter],
    (bookmarks, favoriteFilter) =>
        _findMatchingBookmarks(
            bookmarks,
            typeof favoriteFilter !== "undefined",
            (b) => b.favorite === favoriteFilter,
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
      selectFavoriteMatchedBookmarkIds
   ],
   (
       bookmarkIds, 
       andMatches, 
       orMatches, 
       notMatches,
       contentMatches,
       archiveMatches,
       favoriteMatches
   ) => {
      const filterMatches = [andMatches, orMatches, notMatches, contentMatches, archiveMatches, favoriteMatches];
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
      const orderFactor = sort.ascending ? 1 : -1;
      const cmp = <T>(a: T, b: T): number =>
         orderFactor * (a < b ? -1 : a > b ? 1 : 0);

      const regex = RegExp(/^(?:https?|ftp):\/\/www\d*\./i).compile();

      const domain = (url: string) => url.replace(regex, "");
      const comparisonsByField: {
         [field in BookmarkSortField]: BookmarkComparer;
      } = {
         [BookmarkSortField.url]: (a, b) => cmp(domain(a.url), domain(b.url)),
         [BookmarkSortField.title]: (a, b) => cmp(a.title, b.title),
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
