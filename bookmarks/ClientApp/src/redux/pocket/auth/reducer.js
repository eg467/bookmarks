"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectors = exports.initialState = void 0;
const pocket_api_1 = require("../../../api/pocket-api");
const actions = require("./actions");
exports.initialState = {
    username: pocket_api_1.default.username,
    error: "",
    loading: false,
};
const hydratedState = {
    ...exports.initialState
};
function default_1(state = hydratedState, action) {
    switch (action.type) {
        case actions.ActionType.FETCH_REQUEST_TOKEN:
        case actions.ActionType.FETCH_ACCESS_TOKEN:
            return {
                ...state,
                loading: true
            };
        case actions.ActionType.FETCH_REQUEST_TOKEN_SUCCESS:
            return {
                ...exports.initialState
            };
        case actions.ActionType.FETCH_ACCESS_TOKEN_SUCCESS:
            return {
                ...exports.initialState,
                username: action.response.username,
            };
        case actions.ActionType.FETCH_REQUEST_TOKEN_FAILURE:
        case actions.ActionType.FETCH_ACCESS_TOKEN_FAILURE:
            return { ...exports.initialState, error: action.error };
        case actions.ActionType.LOGOUT:
            return { ...exports.initialState };
        case actions.ActionType.REFRESH_AUTH_STATE:
            return {
                ...state,
                username: action.username,
            };
        default:
            return state;
    }
}
exports.default = default_1;
exports.selectors = {
    username: (state) => state.pocket.auth.username,
    isAuthenticated: (state) => !!state.pocket.auth.username,
};
//# sourceMappingURL=reducer.js.map