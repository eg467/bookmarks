import { combineReducers } from 'redux'
import { AppState } from '../root/reducer';
import auth, { PocketAuthState } from './auth/reducer';
import bookmarks, { PocketBookmarkState } from './bookmarks/reducer';

const pocketReducer = combineReducers<PocketState>({
    auth, bookmarks
});

export default pocketReducer;
export type PocketState = {
    auth: PocketAuthState;
    bookmarks: PocketBookmarkState;
}

export const selectors = {
    auth: (state: AppState) => state.pocket.auth,
    bookmarks: (state: AppState) => state.pocket.bookmarks
};