import { AppState } from "./root/reducer";
export declare const selectors: {
    selectState: (state: AppState) => AppState;
    selectPocketState: (state: AppState) => import("./pocket/reducer").PocketState;
    selectBookmarksState: (state: AppState) => import("./bookmarks/reducer").BookmarkState;
};
