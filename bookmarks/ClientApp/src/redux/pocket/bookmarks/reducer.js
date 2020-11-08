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
var actions = require("./actions");
exports.initialState = {
    bookmarks: {},
    readonly: true,
    loading: false,
    error: null
};
// REDUCER
function default_1(state, action) {
    if (state === void 0) { state = exports.initialState; }
    switch (action.type) {
        // FETCH BOOKMARKS
        case actions.ActionType.FETCH_BOOKMARKS:
            return __assign(__assign({}, state), { loading: true, error: null });
        case actions.ActionType.FETCH_BOOKMARKS_SUCCESS:
            var _a = action.response, readonly = _a.readonly, bookmarks = _a.bookmarks;
            return __assign(__assign({}, state), { readonly: readonly,
                bookmarks: bookmarks, loading: false, error: null });
        case actions.ActionType.FETCH_BOOKMARKS_FAILURE:
            return __assign(__assign({}, state), { bookmarks: {}, loading: true, error: action.error });
        // REMOVE BOOKMARK
        case actions.ActionType.REMOVE_BOOKMARK:
            return __assign(__assign({}, state), { loading: true, error: null });
        case actions.ActionType.REMOVE_BOOKMARK_SUCCESS:
            var id = action.payload.id;
            var copy = __assign({}, state.bookmarks);
            delete copy[id];
            return __assign(__assign({}, state), { bookmarks: copy, loading: false, error: null });
        case actions.ActionType.REMOVE_BOOKMARK_FAILURE:
            return __assign(__assign({}, state), { loading: false, error: action.error });
        // DEFAULT
        default:
            return state;
    }
}
exports.default = default_1;
// SELECTORS
exports.selectors = {
    isReadonly: function (state) { return state.pocket.bookmarks; },
    isLoading: function (state) { return state.pocket.bookmarks.loading; },
    selectBookmarks: function (state) { return state.pocket.bookmarks.bookmarks; },
    selectBookmark: function (state, id) { return state.pocket.bookmarks.bookmarks[id]; },
};
//# sourceMappingURL=reducer.js.map