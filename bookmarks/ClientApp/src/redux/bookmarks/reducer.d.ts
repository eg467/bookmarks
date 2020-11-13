import * as actions from "./actions";
import * as pocketActions from "../pocket/bookmarks/actions";
import {
   BookmarkSortField,
   BookmarkCollection,
   BookmarkData,
} from "./bookmarks";
import { BookmarkKeys, BookmarkPersister } from "../../api/bookmark-io";
import { AppState } from "../root/reducer";
import { RequestStatesState } from "../request-states/reducer";
export declare enum BookmarkSourceType {
   none = 0,
   pocket = 1,
   json = 2,
   savedJson = 3,
   externalJson = 4,
   browserBookmarks = 5,
}
export interface BookmarkSource {
   type: BookmarkSourceType;
   description: string;
   bookmarkSetIdentifier?: string;
}
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
   };
   source: BookmarkSource;
   requestStates: RequestStatesState;
}
export declare const initialState: BookmarkState;
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
export declare const createDirtyPartialSuccessResult: (
   keys: BookmarkKeys,
) => PartialSuccessResult;
export declare const standardizeTags: (tags: string[]) => string[];
declare const reducer: <Base extends {
   readonly bookmarks: {
      readonly [x: string]: {
         readonly [x: string]: any;
         readonly id: string;
         readonly tags: readonly string[];
         readonly url: string;
         readonly title: string;
         readonly added: number;
         readonly authors?: readonly string[];
         readonly resolvedUrl?: string;
         readonly image?: string;
         readonly favorite?: boolean;
         readonly archive?: boolean;
         readonly excerpt?: string;
      };
   };
   readonly sort: {
      readonly field: BookmarkSortField;
      readonly ascending: boolean;
   };
   readonly filters: {
      readonly andFilterTags: readonly string[];
      readonly orFilterTags: readonly string[];
      readonly notFilterTags: readonly string[];
      readonly contentFilter: string;
   };
   readonly source: {
      readonly type: BookmarkSourceType;
      readonly description: string;
      readonly bookmarkSetIdentifier?: string;
   };
   readonly requestStates: {
      readonly byBookmark: {
         readonly [x: string]: {
            readonly 0?: {
               readonly state: import("../request-states/reducer").RequestStateType;
               readonly error?: string;
            };
            readonly 1?: {
               readonly state: import("../request-states/reducer").RequestStateType;
               readonly error?: string;
            };
            readonly 2?: {
               readonly state: import("../request-states/reducer").RequestStateType;
               readonly error?: string;
            };
            readonly 3?: {
               readonly state: import("../request-states/reducer").RequestStateType;
               readonly error?: string;
            };
            readonly 4?: {
               readonly state: import("../request-states/reducer").RequestStateType;
               readonly error?: string;
            };
            readonly 5?: {
               readonly state: import("../request-states/reducer").RequestStateType;
               readonly error?: string;
            };
            readonly 6?: {
               readonly state: import("../request-states/reducer").RequestStateType;
               readonly error?: string;
            };
         };
      };
      readonly bulkRequests: {
         readonly 0?: {
            readonly state: import("../request-states/reducer").RequestStateType;
            readonly error?: string;
         };
         readonly 1?: {
            readonly state: import("../request-states/reducer").RequestStateType;
            readonly error?: string;
         };
         readonly 2?: {
            readonly state: import("../request-states/reducer").RequestStateType;
            readonly error?: string;
         };
         readonly 3?: {
            readonly state: import("../request-states/reducer").RequestStateType;
            readonly error?: string;
         };
         readonly 4?: {
            readonly state: import("../request-states/reducer").RequestStateType;
            readonly error?: string;
         };
         readonly 5?: {
            readonly state: import("../request-states/reducer").RequestStateType;
            readonly error?: string;
         };
         readonly 6?: {
            readonly state: import("../request-states/reducer").RequestStateType;
            readonly error?: string;
         };
      };
   };
}>(
   base: Base,
   action:
      | import("../common/actions").NullAction
      | actions.ShowBookmarksAction
      | actions.AddBookmarkAction
      | actions.AddBookmarkSuccessAction
      | actions.AddBookmarkFailureAction
      | actions.AddBookmarkClearAction
      | actions.RemoveBookmarkAction
      | actions.RemoveBookmarkSuccessAction
      | actions.RemoveBookmarkFailureAction
      | actions.RemoveBookmarkClearAction
      | actions.ArchiveBookmarkAction
      | actions.ArchiveBookmarkSuccessAction
      | actions.ArchiveBookmarkFailureAction
      | actions.ArchiveBookmarkClearAction
      | actions.FavoriteBookmarkAction
      | actions.FavoriteBookmarkSuccessAction
      | actions.FavoriteBookmarkFailureAction
      | actions.FavoriteBookmarkClearAction
      | actions.ModifyTagsAction
      | actions.ModifyTagsSuccessAction
      | actions.ModifyTagsFailureAction
      | actions.ModifyTagsClearAction
      | actions.RenameTagAction
      | actions.RenameTagSuccessAction
      | actions.RenameTagFailureAction
      | actions.RenameTagClearAction
      | actions.DeleteTagAction
      | actions.DeleteTagSuccessAction
      | actions.DeleteTagFailureAction
      | actions.DeleteTagClearAction
      | actions.SortBookmarksAction
      | actions.SetAndTagsAction
      | actions.SetOrTagsAction
      | actions.SetNotTagsAction
      | actions.SetContentFilterAction
      | pocketActions.FetchBookMarksAction
      | pocketActions.FetchBookMarksSuccessAction
      | pocketActions.FetchBookMarksFailureAction,
) => Base;
export default reducer;
export declare const selectBookmarks: (state: AppState) => BookmarkCollection;
export declare const selectBookmark: (
   state: AppState,
   id: string,
) => BookmarkData;
export declare const selectBookmarkList: import("reselect").OutputSelector<
   AppState,
   BookmarkData[],
   (res: BookmarkCollection) => BookmarkData[]
>;
export declare const selectBookmarkIds: import("reselect").OutputSelector<
   AppState,
   Set<string>,
   (res: BookmarkCollection) => Set<string>
>;
export declare const selectAllTags: import("reselect").OutputSelector<
   AppState,
   string[],
   (res: BookmarkData[]) => string[]
>;
export declare const selectors: {
   selectBookmarkSource: (state: AppState) => BookmarkSource;
   selectBookmarkPersister: import("reselect").OutputSelector<
      AppState,
      BookmarkPersister,
      (res: BookmarkSource) => BookmarkPersister
   >;
   selectCapabilities: import("reselect").OutputSelector<
      AppState,
      (key: Exclude<keyof BookmarkPersister, "sourceType">) => boolean,
      (
         res: BookmarkPersister,
      ) => (key: Exclude<keyof BookmarkPersister, "sourceType">) => boolean
   >;
   selectBookmarks: (state: AppState) => BookmarkCollection;
   selectBookmark: (state: AppState, id: string) => BookmarkData;
   selectAllTags: import("reselect").OutputSelector<
      AppState,
      string[],
      (res: BookmarkData[]) => string[]
   >;
   selectBookmarkIds: import("reselect").OutputSelector<
      AppState,
      Set<string>,
      (res: BookmarkCollection) => Set<string>
   >;
   selectAndFilter: (state: AppState) => string[];
   selectOrFilter: (state: AppState) => string[];
   selectNotFilter: (state: AppState) => string[];
   selectContentFilter: (state: AppState) => string;
   selectAndMatchedBookmarkIds: import("reselect").OutputSelector<
      AppState,
      ReadonlySet<string>,
      (res1: BookmarkData[], res2: string[]) => ReadonlySet<string>
   >;
   selectOrMatchedBookmarkIds: import("reselect").OutputSelector<
      AppState,
      ReadonlySet<string>,
      (res1: BookmarkData[], res2: string[]) => ReadonlySet<string>
   >;
   selectNotMatchedBookmarkIds: import("reselect").OutputSelector<
      AppState,
      ReadonlySet<string>,
      (res1: BookmarkData[], res2: string[]) => ReadonlySet<string>
   >;
   selectContentMatchedBookmarkIds: import("reselect").OutputSelector<
      AppState,
      ReadonlySet<string>,
      (res1: BookmarkData[], res2: string) => ReadonlySet<string>
   >;
   selectFilteredBookmarkIds: import("reselect").OutputSelector<
      AppState,
      ReadonlySet<string>,
      (
         res1: Set<string>,
         res2: ReadonlySet<string>,
         res3: ReadonlySet<string>,
         res4: ReadonlySet<string>,
         res5: ReadonlySet<string>,
      ) => ReadonlySet<string>
   >;
   selectSort: (
      state: AppState,
   ) => {
      field: BookmarkSortField;
      ascending: boolean;
   };
   selectSortedBookmarkIds: import("reselect").OutputSelector<
      AppState,
      string[],
      (
         res1: BookmarkCollection,
         res2: ReadonlySet<string>,
         res3: {
            field: BookmarkSortField;
            ascending: boolean;
         },
      ) => string[]
   >;
};
