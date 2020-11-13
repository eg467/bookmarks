import * as actions from './actions';
export const initialState = {
    bookmarks: {},
    readonly: true,
    loading: false,
    error: null
};
// REDUCER
export default function (state = initialState, action) {
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
// SELECTORS
export const selectors = {
    isReadonly: (state) => state.pocket.bookmarks,
    isLoading: (state) => state.pocket.bookmarks.loading,
    selectBookmarks: (state) => state.pocket.bookmarks.bookmarks,
    selectBookmark: (state, id) => state.pocket.bookmarks.bookmarks[id],
};
