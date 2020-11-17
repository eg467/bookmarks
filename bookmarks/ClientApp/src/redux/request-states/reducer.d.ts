import { AppState } from "../root/reducer";
export declare const makeReqState: {
   pending: () => RequestState;
   success: () => RequestState;
   error: (message: string) => RequestState;
   clear: () => RequestState;
};
export declare type RequestState = {
   state: RequestStateType;
   error?: string;
};
export declare enum RequestStateType {
   inactive = 0,
   error = 1,
   success = 2,
   pending = 3,
}
export declare enum RequestType {
   add = 0,
   remove = 1,
   archive = 2,
   favorite = 3,
   modifyTags = 4,
   renameTag = 5,
   deleteTag = 6,
}
export declare type StateByRequest = Partial<Record<RequestType, RequestState>>;
export declare type RequestStatesState = {
   byBookmark: {
      [bookmarkId: string]: StateByRequest;
   };
   bulkRequests: StateByRequest;
};
declare const _default: <Base extends {
   readonly byBookmark: {
      readonly [x: string]: {
         readonly 0?: {
            readonly state: RequestStateType;
            readonly error?: string;
         };
         readonly 1?: {
            readonly state: RequestStateType;
            readonly error?: string;
         };
         readonly 2?: {
            readonly state: RequestStateType;
            readonly error?: string;
         };
         readonly 3?: {
            readonly state: RequestStateType;
            readonly error?: string;
         };
         readonly 4?: {
            readonly state: RequestStateType;
            readonly error?: string;
         };
         readonly 5?: {
            readonly state: RequestStateType;
            readonly error?: string;
         };
         readonly 6?: {
            readonly state: RequestStateType;
            readonly error?: string;
         };
      };
   };
   readonly bulkRequests: {
      readonly 0?: {
         readonly state: RequestStateType;
         readonly error?: string;
      };
      readonly 1?: {
         readonly state: RequestStateType;
         readonly error?: string;
      };
      readonly 2?: {
         readonly state: RequestStateType;
         readonly error?: string;
      };
      readonly 3?: {
         readonly state: RequestStateType;
         readonly error?: string;
      };
      readonly 4?: {
         readonly state: RequestStateType;
         readonly error?: string;
      };
      readonly 5?: {
         readonly state: RequestStateType;
         readonly error?: string;
      };
      readonly 6?: {
         readonly state: RequestStateType;
         readonly error?: string;
      };
   };
}>(
   base?: Base,
   action:
      | import("./actions").SetGlobalReqStateAction
      | import("./actions").RemoveGlobalReqStateAction
      | import("./actions").SetBookmarkReqStateAction
      | import("./actions").RemoveBookmarkReqStateAction
      | import("./actions").ClearRequestStatesAction
      | import("../common/actions").NullAction
      | import("../bookmarks/actions").LoadBookmarksAction
      | import("../bookmarks/actions").AddBookmarkAction
      | import("../bookmarks/actions").AddBookmarkSuccessAction
      | import("../bookmarks/actions").AddBookmarkFailureAction
      | import("../bookmarks/actions").AddBookmarkClearAction
      | import("../bookmarks/actions").RemoveBookmarkAction
      | import("../bookmarks/actions").RemoveBookmarkSuccessAction
      | import("../bookmarks/actions").RemoveBookmarkFailureAction
      | import("../bookmarks/actions").RemoveBookmarkClearAction
      | import("../bookmarks/actions").ArchiveBookmarkAction
      | import("../bookmarks/actions").ArchiveBookmarkSuccessAction
      | import("../bookmarks/actions").ArchiveBookmarkFailureAction
      | import("../bookmarks/actions").ArchiveBookmarkClearAction
      | import("../bookmarks/actions").FavoriteBookmarkAction
      | import("../bookmarks/actions").FavoriteBookmarkSuccessAction
      | import("../bookmarks/actions").FavoriteBookmarkFailureAction
      | import("../bookmarks/actions").FavoriteBookmarkClearAction
      | import("../bookmarks/actions").ModifyTagsAction
      | import("../bookmarks/actions").ModifyTagsSuccessAction
      | import("../bookmarks/actions").ModifyTagsFailureAction
      | import("../bookmarks/actions").ModifyTagsClearAction
      | import("../bookmarks/actions").RenameTagAction
      | import("../bookmarks/actions").RenameTagSuccessAction
      | import("../bookmarks/actions").RenameTagFailureAction
      | import("../bookmarks/actions").RenameTagClearAction
      | import("../bookmarks/actions").DeleteTagAction
      | import("../bookmarks/actions").DeleteTagSuccessAction
      | import("../bookmarks/actions").DeleteTagFailureAction
      | import("../bookmarks/actions").DeleteTagClearAction
      | import("../bookmarks/actions").SortBookmarksAction
      | import("../bookmarks/actions").SetAndTagsAction
      | import("../bookmarks/actions").SetOrTagsAction
      | import("../bookmarks/actions").SetNotTagsAction
      | import("../bookmarks/actions").SetContentFilterAction,
) => boolean;
export default _default;
/**
 * Parses request status taking into account that inactive states have no entries for space saving.
 * Technically not a selector, but used to read from createSelectRequestState
 * @param states
 * @param reqType
 */
export declare const readRequestState: (
   states: StateByRequest | undefined,
   reqType: RequestType,
) => RequestState;
export declare const selectors: {
   selectRequestStates: (state: AppState) => RequestStatesState;
   selectBulkRequestStates: (
      state: AppState,
   ) => Partial<Record<RequestType, RequestState>>;
   createSelectRequestState: () => import("reselect").OutputParametricSelector<
      AppState,
      {
         bookmarkId: string;
      },
      {
         states: Partial<Record<RequestType, RequestState>>;
         bulkStates: Partial<Record<RequestType, RequestState>>;
         reqStatus: (reqType: RequestType) => RequestState;
      },
      (
         res1: Partial<Record<RequestType, RequestState>>,
         res2: Partial<Record<RequestType, RequestState>>,
         res3: string,
      ) => {
         states: Partial<Record<RequestType, RequestState>>;
         bulkStates: Partial<Record<RequestType, RequestState>>;
         reqStatus: (reqType: RequestType) => RequestState;
      }
   >;
   selectRequestStatesByBookmark: (
      state: AppState,
   ) => {
      [bookmarkId: string]: Partial<Record<RequestType, RequestState>>;
   };
};
