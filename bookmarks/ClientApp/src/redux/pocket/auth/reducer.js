"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectors = exports.initialState = void 0;
var pocket_api_1 = require("../../../api/pocket-api");
var actions = require("./actions");
exports.initialState = {
    username: pocket_api_1.default.username,
    error: "",
    loading: false,
};
var hydratedState = __assign({}, exports.initialState);
function default_1(state, action) {
    if (state === void 0) { state = hydratedState; }
    switch (action.type) {
        case actions.ActionType.FETCH_REQUEST_TOKEN:
        case actions.ActionType.FETCH_ACCESS_TOKEN:
            return __assign(__assign({}, state), { loading: true });
        case actions.ActionType.FETCH_REQUEST_TOKEN_SUCCESS:
            return __assign({}, exports.initialState);
        case actions.ActionType.FETCH_ACCESS_TOKEN_SUCCESS:
            return __assign(__assign({}, exports.initialState), { username: action.response.username });
        case actions.ActionType.FETCH_REQUEST_TOKEN_FAILURE:
        case actions.ActionType.FETCH_ACCESS_TOKEN_FAILURE:
            return __assign(__assign({}, exports.initialState), { error: action.error });
        case actions.ActionType.LOGOUT:
            return __assign({}, exports.initialState);
        case actions.ActionType.REFRESH_AUTH_STATE:
            return __assign(__assign({}, state), { username: action.username });
        default:
            return state;
    }
}
exports.default = default_1;
exports.selectors = {
    username: function (state) { return state.pocket.auth.username; },
    isAuthenticated: function (state) { return !!state.pocket.auth.username; },
};
//# sourceMappingURL=reducer.js.map