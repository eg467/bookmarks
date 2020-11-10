"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectors = exports.initialState = void 0;
const actions = require("./actions");
exports.initialState = {
    bookmarks: {},
    readonly: true,
    loading: false,
    error: null
};
// REDUCER
function default_1(state = exports.initialState, action) {
    switch (action.type) {
        // FETCH BOOKMARKS
        case actions.ActionType.FETCH_BOOKMARKS:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case actions.ActionType.FETCH_BOOKMARKS_SUCCESS:
            const { bookmarks } = action.response;
            return {
                ...state,
                bookmarks,
                loading: false,
                error: null,
            };
        case actions.ActionType.FETCH_BOOKMARKS_FAILURE:
            return {
                ...state,
                bookmarks: {},
                loading: true,
                error: action.error,
            };
        // DEFAULT
        default:
            return state;
    }
}
exports.default = default_1;
// SELECTORS
exports.selectors = {
    isReadonly: (state) => state.pocket.bookmarks,
    isLoading: (state) => state.pocket.bookmarks.loading,
    selectBookmarks: (state) => state.pocket.bookmarks.bookmarks,
    selectBookmark: (state, id) => state.pocket.bookmarks.bookmarks[id],
};
//# sourceMappingURL=reducer.js.map