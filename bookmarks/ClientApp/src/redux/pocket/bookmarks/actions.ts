import pocketApi from "../../../api/pocket-api";
import { StartPromiseAction, PromiseSuccessAction, PromiseFailureAction, createPromiseAction, PromiseMiddlewareAction } from "../../middleware/promise-middleware";
import { MyThunkResult, AppState } from "../../../redux/root/reducer";
import { BookmarkCollection } from "../../../redux/bookmarks/bookmarks";
import { StoreDispatch } from "../../../redux/store/configureStore";
import action from "../../root/action";
import { AnyAction } from "redux";
import { BookmarkSource, BookmarkSourceType } from "../../bookmarks/reducer";

export enum ActionType {
    FETCH_BOOKMARKS = "pocket/bookmarks/FETCH_BOOKMARKS",
    FETCH_BOOKMARKS_SUCCESS = "pocket/bookmarks/FETCH_BOOKMARKS_SUCCESS",
    FETCH_BOOKMARKS_FAILURE = "pocket/bookmarks/FETCH_BOOKMARKS_FAILURE",
    REMOVE_BOOKMARK = "pocket/bookmarks/REMOVE_BOOKMARK",
    REMOVE_BOOKMARK_SUCCESS = "pocket/bookmarks/REMOVE_BOOKMARK_SUCCESS",
    REMOVE_BOOKMARK_FAILURE = "pocket/bookmarks/REMOVE_BOOKMARK_FAILURE",
}

// ACTIONS
export interface FetchBookmarksResponse {
    bookmarks: BookmarkCollection;
    source: BookmarkSource;
}

export type FetchBookMarksAction = StartPromiseAction<ActionType.FETCH_BOOKMARKS, void>;
export type FetchBookMarksSuccessAction = PromiseSuccessAction<ActionType.FETCH_BOOKMARKS_SUCCESS, FetchBookmarksResponse, void>;
export type FetchBookMarksFailureAction = PromiseFailureAction<ActionType.FETCH_BOOKMARKS_FAILURE, void>;

// TYPES

export type PocketBookmarksAction =
    FetchBookMarksAction | FetchBookMarksSuccessAction | FetchBookMarksFailureAction;

// ACTION CREATORS

export const actionCreators = {
    fetchBookmarks: () =>
        createPromiseAction({
            startType: ActionType.FETCH_BOOKMARKS,
            successType: ActionType.FETCH_BOOKMARKS_SUCCESS,
            failureType: ActionType.FETCH_BOOKMARKS_FAILURE,
            promise: () => pocketApi.retrieve({})
                .then(bookmarks => <FetchBookmarksResponse>{ bookmarks, source: { description: "Pocket", type: BookmarkSourceType.pocket } })
        }),
};