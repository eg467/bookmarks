import {BookmarkCollection} from "../bookmarks/bookmarks";
import {BookmarkSource, BookmarkSourceType, SourceTrustLevel} from "../bookmarks/reducer";
import {
   createPromiseAction,
   PromiseFailureAction,
   PromiseSuccessAction,
   StartPromiseAction
} from "../middleware/promise-middleware";
import pocketApi, {PocketApiAuthState} from "../../api/pocket-api";
import {AppState, MyThunkDispatch, MyThunkResult} from "../root/reducer";
import {StoreDispatch} from "../store/configureStore";
export default PocketAction;

export enum ActionType {
   LOGIN = "pocket/auth/LOGIN",
   LOGIN_SUCCESS = "pocket/auth/LOGIN_SUCCESS",
   LOGIN_FAILURE = "pocket/auth/LOGIN_FAILURE",
   REDIRECT_TO_POCKET = "pocket/auth/REDIRECT_TO_POCKET",
   RECEIVE_POCKET_CALLBACK = "pocket/auth/RECEIVE_POCKET_CALLBACK",
   REFRESH_AUTH_STATE = "pocket/auth/REFRESH_AUTH_STATE",
   WAITING_FOR_REDIRECTION = "pocket/auth/WAITING_FOR_REDIRECTION",
   LOGOUT = "pocket/auth/LOGOUT",
   FETCH_BOOKMARKS = "pocket/bookmarks/FETCH_BOOKMARKS",
   FETCH_BOOKMARKS_SUCCESS = "pocket/bookmarks/FETCH_BOOKMARKS_SUCCESS",
   FETCH_BOOKMARKS_FAILURE = "pocket/bookmarks/FETCH_BOOKMARKS_FAILURE",
   REMOVE_BOOKMARK = "pocket/bookmarks/REMOVE_BOOKMARK",
   REMOVE_BOOKMARK_SUCCESS = "pocket/bookmarks/REMOVE_BOOKMARK_SUCCESS",
   REMOVE_BOOKMARK_FAILURE = "pocket/bookmarks/REMOVE_BOOKMARK_FAILURE",
}

// ACTIONS
export type FetchBookMarksAction = StartPromiseAction<ActionType.FETCH_BOOKMARKS, void>;
export type FetchBookMarksSuccessAction = PromiseSuccessAction<ActionType.FETCH_BOOKMARKS_SUCCESS, FetchBookmarksResponse, void>;
export type FetchBookMarksFailureAction = PromiseFailureAction<ActionType.FETCH_BOOKMARKS_FAILURE, void>;


export interface RedirectToPocketAction {
   type: ActionType.REDIRECT_TO_POCKET;
   requestToken: string;
   redirectUri: string;
}

export interface ReceivePocketCallbackAction {
   type: ActionType.RECEIVE_POCKET_CALLBACK;
}

export interface LogoutAction {
   type: ActionType.LOGOUT;
}

export type LoginActionPayload = void;
export type LoginActionResponse = PocketApiAuthState;
export type LoginAction = StartPromiseAction<
   ActionType.LOGIN,
   LoginActionPayload
   >;
export type LoginSuccessAction = PromiseSuccessAction<
   ActionType.LOGIN_SUCCESS,
   LoginActionResponse,
   LoginActionPayload
   >;
export type LoginFailureAction = PromiseFailureAction<
   ActionType.LOGIN_FAILURE,
   LoginActionPayload
   >;

export interface RefreshAuthStateAction {
   type: ActionType.REFRESH_AUTH_STATE;
   username: string;
}

export interface FetchBookmarksResponse {
   bookmarks: BookmarkCollection;
   source: BookmarkSource;
}

export type PocketAction =
   FetchBookMarksAction 
   | FetchBookMarksSuccessAction 
   | FetchBookMarksFailureAction
   | LoginAction
   | LoginSuccessAction
   | LoginFailureAction
   | RedirectToPocketAction
   | ReceivePocketCallbackAction
   | LogoutAction
   | RefreshAuthStateAction;


export const actionCreators = {
   logout: () => {
      return (dispatch: MyThunkDispatch) => {
         pocketApi.logout();
         console.log("After logout, username is", pocketApi.username);
         dispatch({ type: ActionType.LOGOUT } as LogoutAction);
      };
   },

   login: (): MyThunkResult<Promise<LoginSuccessAction>> => {
      return (dispatch: StoreDispatch) => {
         return dispatch({
            successType: ActionType.LOGIN_SUCCESS,
            failureType: ActionType.LOGIN_FAILURE,
            startType: ActionType.LOGIN,
            promise: () =>
               pocketApi.login().catch((error) => {
                  pocketApi.logout();
                  throw error;
               }),
         });
      };
   },

   userAuthorized: (): ReceivePocketCallbackAction | LoginFailureAction => {
      try {
         pocketApi.userHasAuthorized();
         return { type: ActionType.RECEIVE_POCKET_CALLBACK };
      } catch (e) {
         return {
            type: ActionType.LOGIN_FAILURE,
            error: String(e),
            payload: undefined,
         };
      }
   },

   fetchBookmarks: () =>
      (dispatch: StoreDispatch, getState: () => AppState) => {
         return dispatch(createPromiseAction({
            startType: ActionType.FETCH_BOOKMARKS,
            successType: ActionType.FETCH_BOOKMARKS_SUCCESS,
            failureType: ActionType.FETCH_BOOKMARKS_FAILURE,
            promise: () => pocketApi.retrieve({})
               .then(bookmarks => {
                     const source: BookmarkSource = {
                        description: "Pocket",
                        type: BookmarkSourceType.pocket,
                        trusted: SourceTrustLevel.trusted
                     };

                     //dispatch(bmActionCreators.loadBookmarks(bookmarks, source));
                     return { bookmarks, source } as FetchBookmarksResponse;
                  },
                  console.error)
         }));
      }
};
