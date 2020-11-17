import { NullAction } from "../../common/actions";

import { MyThunkResult, MyThunkDispatch } from "../../root/reducer";
import pocketApi, { PocketApiAuthState } from "../../../api/pocket-api";
import { PocketAuthState } from "./reducer";
import {
   PromiseSuccessAction,
   StartPromiseAction,
   PromiseFailureAction,
   createPromiseAction,
} from "../../../redux/middleware/promise-middleware";
import { ActionCreator } from "redux";
import storage from "../../../api/local-storage";
import { StoreDispatch } from "../../../redux/store/configureStore";

// ACTIONS

export enum ActionType {
   LOGIN = "pocket/auth/LOGIN",
   LOGIN_SUCCESS = "pocket/auth/LOGIN_SUCCESS",
   LOGIN_FAILURE = "pocket/auth/LOGIN_FAILURE",
   REDIRECT_TO_POCKET = "pocket/auth/REDIRECT_TO_POCKET",
   RECEIVE_POCKET_CALLBACK = "pocket/auth/RECEIVE_POCKET_CALLBACK",
   REFRESH_AUTH_STATE = "pocket/auth/REFRESH_AUTH_STATE",
   WAITING_FOR_REDIRECTION = "pocket/auth/WAITING_FOR_REDIRECTION",
   LOGOUT = "pocket/auth/LOGOUT",
}

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

export type PocketAuthActionTypes =
   | LoginAction
   | LoginSuccessAction
   | LoginFailureAction
   | RedirectToPocketAction
   | ReceivePocketCallbackAction
   | LogoutAction
   | RefreshAuthStateAction
   | NullAction;

// ACTION CREATORS

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
};
