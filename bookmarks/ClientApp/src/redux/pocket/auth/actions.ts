import { NullAction } from "../../common/actions";

import { MyThunkResult, MyThunkDispatch } from "../../root/reducer";
import pocketApi from "../../../api/pocket-api";
import { PocketAuthState } from "./reducer";
import { PromiseSuccessAction, StartPromiseAction, PromiseFailureAction, createPromiseAction } from "../../../redux/middleware/promise-middleware";
import { ActionCreator } from "redux";
import storage from "../../../api/local-storage";
import { StoreDispatch } from "../../../redux/store/configureStore";

// ACTIONS

export enum ActionType {
    FETCH_REQUEST_TOKEN = "pocket/auth/FETCH_REQUEST_TOKEN",
    FETCH_REQUEST_TOKEN_SUCCESS = "pocket/auth/FETCH_REQUEST_TOKEN_SUCCESS",
    FETCH_REQUEST_TOKEN_FAILURE = "pocket/auth/FETCH_REQUEST_TOKEN_FAILURE",
    REDIRECT_TO_POCKET = "pocket/auth/REDIRECT_TO_POCKET",
    RECEIVE_POCKET_CALLBACK = "pocket/auth/RECEIVE_POCKET_CALLBACK",
    FETCH_ACCESS_TOKEN = "pocket/auth/FETCH_ACCESS_TOKEN",
    FETCH_ACCESS_TOKEN_SUCCESS = "pocket/auth/FETCH_ACCESS_TOKEN_SUCCESS",
    FETCH_ACCESS_TOKEN_FAILURE = "pocket/auth/FETCH_ACCESS_TOKEN_FAILURE",
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

export type FetchRequestTokenActionPayload = void;
export type FetchRequestTokenActionResponse = void;

export type FetchRequestTokenAction = StartPromiseAction<
    ActionType.FETCH_REQUEST_TOKEN,
    FetchRequestTokenActionPayload
>;

export type FetchRequestTokenSuccessAction = PromiseSuccessAction<
    ActionType.FETCH_REQUEST_TOKEN_SUCCESS,
    FetchRequestTokenActionResponse,
    FetchRequestTokenActionPayload
>;

export type FetchRequestTokenFailureAction = PromiseFailureAction<
    ActionType.FETCH_REQUEST_TOKEN_FAILURE,
    FetchRequestTokenActionPayload
>;

export type FetchAccessTokenActionResponse = {
    accessToken: string;
    username: string;
};

export type FetchAccessTokenActionPayload = {
    requestToken: string;
};

export type FetchAccessTokenAction = StartPromiseAction<
    ActionType.FETCH_ACCESS_TOKEN,
    FetchAccessTokenActionPayload
>;

export type FetchAccessTokenSuccessAction = PromiseSuccessAction<
    ActionType.FETCH_ACCESS_TOKEN_SUCCESS,
    FetchAccessTokenActionResponse,
    FetchAccessTokenActionPayload
>;

export type FetchAccessTokenFailureAction = PromiseFailureAction<
    ActionType.FETCH_ACCESS_TOKEN_FAILURE,
    FetchAccessTokenActionPayload
>;

export interface SetWaitingForRedirectionAction {
    type: ActionType.WAITING_FOR_REDIRECTION;
    value: boolean;
}

export interface RefreshAuthStateAction {
    type: ActionType.REFRESH_AUTH_STATE;
    username: string;
}

export type PocketAuthActionTypes =
    FetchRequestTokenAction | FetchRequestTokenSuccessAction | FetchRequestTokenFailureAction
    | RedirectToPocketAction | ReceivePocketCallbackAction | LogoutAction
    | FetchAccessTokenAction | FetchAccessTokenSuccessAction | FetchAccessTokenFailureAction
    | RefreshAuthStateAction | SetWaitingForRedirectionAction | NullAction;

// ACTION CREATORS

export const actionCreators = {
    logout: () => {
        return (dispatch: MyThunkDispatch) => {
            pocketApi.logout();
            dispatch({ type: ActionType.LOGOUT } as LogoutAction);
        };
    },

    initAuthentication: (): MyThunkResult<Promise<FetchRequestTokenSuccessAction>> => {
        return (dispatch: StoreDispatch) => {
            return dispatch({
                successType: ActionType.FETCH_REQUEST_TOKEN_SUCCESS,
                failureType: ActionType.FETCH_REQUEST_TOKEN_FAILURE,
                startType: ActionType.FETCH_REQUEST_TOKEN,
                promise: () => pocketApi.getRequestToken().catch(
                    error => {
                        pocketApi.logout();
                        throw error;
                    }
                )
            });
        };
    },

    /**
     * Rehydrate the authentication process in case
     * the user just returned from the Pocket site and needs to convert a request code to an auth token
     * or the page is refreshing and needs to reload
     */
    continueAuthentication: (): MyThunkResult<Promise<boolean>> => {
        return async (dispatch: StoreDispatch) => {
            // An authorized request token exists that's waiting to be authorized and converted into an access token.
            if (pocketApi.requiresAuthorization) {
                try {
                    await dispatch(createPromiseAction({
                        successType: ActionType.FETCH_ACCESS_TOKEN_SUCCESS,
                        startType: ActionType.FETCH_ACCESS_TOKEN,
                        failureType: ActionType.FETCH_ACCESS_TOKEN_FAILURE,
                        promise: () => pocketApi.getAccessTokenFromRequestToken()
                    }));
                    return true;
                } catch (err) {
                    pocketApi.logout();
                    return false;
                }
            }

            dispatch(<RefreshAuthStateAction>{
                type: ActionType.REFRESH_AUTH_STATE,
                username: pocketApi.username
            });

            return !!pocketApi.isAuthenticated;
        };
    }
};