import * as actions from './actions';
import { BookmarkCollection } from '../../../redux/bookmarks/bookmarks';
import { AppState } from '../../root/reducer';

export interface PocketBookmarkState {
    bookmarks: BookmarkCollection;
    readonly: boolean;
    loading: boolean;
    error: string | null;
}

export const initialState: PocketBookmarkState = {
    bookmarks: {},
    readonly: true,
    loading: false,
    error: null
}

// REDUCER

export default function (state: PocketBookmarkState = initialState, action: actions.PocketBookmarksAction): PocketBookmarkState {
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
    isReadonly: (state: AppState) => state.pocket.bookmarks,
    isLoading: (state: AppState) => state.pocket.bookmarks.loading,
    selectBookmarks: (state: AppState) => state.pocket.bookmarks.bookmarks,
    selectBookmark: (state: AppState, id: string) => state.pocket.bookmarks.bookmarks[id],
};