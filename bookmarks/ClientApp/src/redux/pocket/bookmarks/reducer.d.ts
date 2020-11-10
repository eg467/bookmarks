import * as actions from './actions';
import { BookmarkCollection } from '../../../redux/bookmarks/bookmarks';
import { AppState } from '../../root/reducer';
export interface PocketBookmarkState {
    bookmarks: BookmarkCollection;
    readonly: boolean;
    loading: boolean;
    error: string | null;
}
export declare const initialState: PocketBookmarkState;
export default function (state: PocketBookmarkState, action: actions.PocketBookmarksAction): PocketBookmarkState;
export declare const selectors: {
    isReadonly: (state: AppState) => PocketBookmarkState;
    isLoading: (state: AppState) => boolean;
    selectBookmarks: (state: AppState) => BookmarkCollection;
    selectBookmark: (state: AppState, id: string) => import("../../bookmarks/bookmarks").BookmarkData;
};
