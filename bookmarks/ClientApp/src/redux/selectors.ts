import { AppState } from "./root/reducer";

export const selectors = {
    selectState: (state: AppState) => state,
    selectPocketState: (state: AppState) => state.pocket,
    selectBookmarksState: (state: AppState) => state.bookmarks,
};