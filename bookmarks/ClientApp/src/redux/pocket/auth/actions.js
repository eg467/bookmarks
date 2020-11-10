"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionCreators = exports.ActionType = void 0;
const pocket_api_1 = require("../../../api/pocket-api");
const promise_middleware_1 = require("../../../redux/middleware/promise-middleware");
// ACTIONS
var ActionType;
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
})(ActionType = exports.ActionType || (exports.ActionType = {}));
// ACTION CREATORS
exports.actionCreators = {
    logout: () => {
        return (dispatch) => {
            pocket_api_1.default.logout();
            dispatch({ type: ActionType.LOGOUT });
        };
    },
    initAuthentication: () => {
        return (dispatch) => {
            return dispatch({
                successType: ActionType.FETCH_REQUEST_TOKEN_SUCCESS,
                failureType: ActionType.FETCH_REQUEST_TOKEN_FAILURE,
                startType: ActionType.FETCH_REQUEST_TOKEN,
                promise: () => pocket_api_1.default.getRequestToken().catch(error => {
                    pocket_api_1.default.logout();
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
            if (pocket_api_1.default.requiresAuthorization) {
                try {
                    await dispatch(promise_middleware_1.createPromiseAction({
                        successType: ActionType.FETCH_ACCESS_TOKEN_SUCCESS,
                        startType: ActionType.FETCH_ACCESS_TOKEN,
                        failureType: ActionType.FETCH_ACCESS_TOKEN_FAILURE,
                        promise: () => pocket_api_1.default.getAccessTokenFromRequestToken()
                    }));
                    return true;
                }
                catch (err) {
                    pocket_api_1.default.logout();
                    return false;
                }
            }
            dispatch({
                type: ActionType.REFRESH_AUTH_STATE,
                username: pocket_api_1.default.username
            });
            return !!pocket_api_1.default.isAuthenticated;
        };
    }
};
//# sourceMappingURL=actions.js.map