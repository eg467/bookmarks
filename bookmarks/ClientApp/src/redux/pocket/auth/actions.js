import pocketApi from "../../../api/pocket-api";
import { createPromiseAction } from "../../../redux/middleware/promise-middleware";
// ACTIONS
export var ActionType;
(function (ActionType) {
    ActionType["FETCH_REQUEST_TOKEN"] = "pocket/auth/FETCH_REQUEST_TOKEN";
    ActionType["FETCH_REQUEST_TOKEN_SUCCESS"] = "pocket/auth/FETCH_REQUEST_TOKEN_SUCCESS";
    ActionType["FETCH_REQUEST_TOKEN_FAILURE"] = "pocket/auth/FETCH_REQUEST_TOKEN_FAILURE";
    ActionType["REDIRECT_TO_POCKET"] = "pocket/auth/REDIRECT_TO_POCKET";
    ActionType["RECEIVE_POCKET_CALLBACK"] = "pocket/auth/RECEIVE_POCKET_CALLBACK";
    ActionType["FETCH_ACCESS_TOKEN"] = "pocket/auth/FETCH_ACCESS_TOKEN";
    ActionType["FETCH_ACCESS_TOKEN_SUCCESS"] = "pocket/auth/FETCH_ACCESS_TOKEN_SUCCESS";
    ActionType["FETCH_ACCESS_TOKEN_FAILURE"] = "pocket/auth/FETCH_ACCESS_TOKEN_FAILURE";
    ActionType["REFRESH_AUTH_STATE"] = "pocket/auth/REFRESH_AUTH_STATE";
    ActionType["WAITING_FOR_REDIRECTION"] = "pocket/auth/WAITING_FOR_REDIRECTION";
    ActionType["LOGOUT"] = "pocket/auth/LOGOUT";
})(ActionType || (ActionType = {}));
// ACTION CREATORS
export const actionCreators = {
    logout: () => {
        return (dispatch) => {
            pocketApi.logout();
            dispatch({ type: ActionType.LOGOUT });
        };
    },
    initAuthentication: () => {
        return (dispatch) => {
            return dispatch({
                successType: ActionType.FETCH_REQUEST_TOKEN_SUCCESS,
                failureType: ActionType.FETCH_REQUEST_TOKEN_FAILURE,
                startType: ActionType.FETCH_REQUEST_TOKEN,
                promise: () => pocketApi.getRequestToken().catch(error => {
                    pocketApi.logout();
                    throw error;
                })
            });
        };
    },
    /**
     * Rehydrate the authentication process in case
     * the user just returned from the Pocket site and needs to convert a request code to an auth token
     * or the page is refreshing and needs to reload
     */
    continueAuthentication: () => {
        return async (dispatch) => {
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
                }
                catch (err) {
                    pocketApi.logout();
                    return false;
                }
            }
            dispatch({
                type: ActionType.REFRESH_AUTH_STATE,
                username: pocketApi.username
            });
            return !!pocketApi.isAuthenticated;
        };
    }
};
