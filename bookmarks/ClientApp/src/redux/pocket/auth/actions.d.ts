import { NullAction } from "../../common/actions";
import { MyThunkResult, MyThunkDispatch } from "../../root/reducer";
import { PromiseSuccessAction, StartPromiseAction, PromiseFailureAction } from "../../../redux/middleware/promise-middleware";
export declare enum ActionType {
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
    LOGOUT = "pocket/auth/LOGOUT"
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
export declare type FetchRequestTokenActionPayload = void;
export declare type FetchRequestTokenActionResponse = void;
export declare type FetchRequestTokenAction = StartPromiseAction<ActionType.FETCH_REQUEST_TOKEN, FetchRequestTokenActionPayload>;
export declare type FetchRequestTokenSuccessAction = PromiseSuccessAction<ActionType.FETCH_REQUEST_TOKEN_SUCCESS, FetchRequestTokenActionResponse, FetchRequestTokenActionPayload>;
export declare type FetchRequestTokenFailureAction = PromiseFailureAction<ActionType.FETCH_REQUEST_TOKEN_FAILURE, FetchRequestTokenActionPayload>;
export declare type FetchAccessTokenActionResponse = {
    accessToken: string;
    username: string;
};
export declare type FetchAccessTokenActionPayload = {
    requestToken: string;
};
export declare type FetchAccessTokenAction = StartPromiseAction<ActionType.FETCH_ACCESS_TOKEN, FetchAccessTokenActionPayload>;
export declare type FetchAccessTokenSuccessAction = PromiseSuccessAction<ActionType.FETCH_ACCESS_TOKEN_SUCCESS, FetchAccessTokenActionResponse, FetchAccessTokenActionPayload>;
export declare type FetchAccessTokenFailureAction = PromiseFailureAction<ActionType.FETCH_ACCESS_TOKEN_FAILURE, FetchAccessTokenActionPayload>;
export interface SetWaitingForRedirectionAction {
    type: ActionType.WAITING_FOR_REDIRECTION;
    value: boolean;
}
export interface RefreshAuthStateAction {
    type: ActionType.REFRESH_AUTH_STATE;
    username: string;
}
export declare type PocketAuthActionTypes = FetchRequestTokenAction | FetchRequestTokenSuccessAction | FetchRequestTokenFailureAction | RedirectToPocketAction | ReceivePocketCallbackAction | LogoutAction | FetchAccessTokenAction | FetchAccessTokenSuccessAction | FetchAccessTokenFailureAction | RefreshAuthStateAction | SetWaitingForRedirectionAction | NullAction;
export declare const actionCreators: {
    logout: () => (dispatch: MyThunkDispatch) => void;
    initAuthentication: () => MyThunkResult<Promise<FetchRequestTokenSuccessAction>>;
    /**
     * Rehydrate the authentication process in case
     * the user just returned from the Pocket site and needs to convert a request code to an auth token
     * or the page is refreshing and needs to reload
     */
    continueAuthentication: () => MyThunkResult<Promise<boolean>>;
};
