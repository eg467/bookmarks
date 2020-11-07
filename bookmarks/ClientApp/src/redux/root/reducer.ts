import { combineReducers, AnyAction } from "redux";
import pocket, { PocketState } from "../pocket/reducer";
import bookmarks, { BookmarkState } from "../bookmarks/reducer";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

// https://gist.github.com/milankorsos/ffb9d32755db0304545f92b11f0e4beb#gistcomment-2716545
type MyThunkExtraArg = undefined;
export type MyThunkResult<R> = ThunkAction<R, AppState, MyThunkExtraArg, AnyAction>
export type MyThunkDispatch = ThunkDispatch<AppState, MyThunkExtraArg, AnyAction>

const rootReducer = combineReducers<AppState>({ pocket, bookmarks });

// Creates confusing type messages
//export type StoreState  = typeof rootReducer;

export interface AppState {
    pocket: PocketState,
    bookmarks: BookmarkState
}

export const selectors = {
    selectState: (state: AppState) => state,
    selectPocketState: (state: AppState) => state.pocket,
    selectBookmarksState: (state: AppState) => state.bookmarks,
};

export default rootReducer;