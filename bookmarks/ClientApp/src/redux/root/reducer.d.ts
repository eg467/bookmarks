import { AnyAction } from "redux";
import { PocketState } from "../pocket/reducer";
import { BookmarkState } from "../bookmarks/reducer";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
declare type MyThunkExtraArg = undefined;
export declare type MyThunkResult<R> = ThunkAction<R, AppState, MyThunkExtraArg, AnyAction>;
export declare type MyThunkDispatch = ThunkDispatch<AppState, MyThunkExtraArg, AnyAction>;
declare const rootReducer: import("redux").Reducer<AppState, AnyAction>;
export interface AppState {
    pocket: PocketState;
    bookmarks: BookmarkState;
}
export declare const selectors: {
    selectState: (state: AppState) => AppState;
    selectPocketState: (state: AppState) => PocketState;
    selectBookmarksState: (state: AppState) => BookmarkState;
};
export default rootReducer;
