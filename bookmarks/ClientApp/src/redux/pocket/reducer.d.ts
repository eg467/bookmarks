import { AppState } from '../root/reducer';
import { PocketAuthState } from './auth/reducer';
import { PocketBookmarkState } from './bookmarks/reducer';
declare const pocketReducer: import("redux").Reducer<PocketState, import("redux").AnyAction>;
export default pocketReducer;
export declare type PocketState = {
    auth: PocketAuthState;
    bookmarks: PocketBookmarkState;
};
export declare const selectors: {
    auth: (state: AppState) => PocketAuthState;
    bookmarks: (state: AppState) => PocketBookmarkState;
};
