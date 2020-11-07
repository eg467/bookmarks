import pocketApi from "../../../api/pocket-api";
import { StartPromiseAction, PromiseSuccessAction, PromiseFailureAction, createPromiseAction, PromiseMiddlewareAction } from "../../middleware/promise-middleware";
import { MyThunkResult, AppState } from "../../../redux/root/reducer";
import { BookmarkCollection } from "../../../redux/bookmarks/bookmarks";
import { StoreDispatch } from "../../../redux/store/configureStore";
import { BookmarkData } from "../../../store/bookmarks";
import action from "../../root/action";
import { AnyAction } from "redux";

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
    readonly: boolean;
}

export type FetchBookMarksAction = StartPromiseAction<ActionType.FETCH_BOOKMARKS, void>;
export type FetchBookMarksSuccessAction = PromiseSuccessAction<ActionType.FETCH_BOOKMARKS_SUCCESS, FetchBookmarksResponse, void>;
export type FetchBookMarksFailureAction = PromiseFailureAction<ActionType.FETCH_BOOKMARKS_FAILURE, void>;

export type RemoveBookmarkPayload = { id: string; }
export type RemoveBookmarkAction = StartPromiseAction<ActionType.REMOVE_BOOKMARK, RemoveBookmarkPayload>;
export type RemoveBookmarkSuccessAction = PromiseSuccessAction<ActionType.REMOVE_BOOKMARK_SUCCESS, void, RemoveBookmarkPayload>;
export type RemoveBookmarkFailureAction = PromiseFailureAction<ActionType.REMOVE_BOOKMARK_FAILURE, RemoveBookmarkPayload>;

// TYPES

export type PocketBookmarksAction =
    FetchBookMarksAction | FetchBookMarksSuccessAction | FetchBookMarksFailureAction |
    RemoveBookmarkAction | RemoveBookmarkSuccessAction | RemoveBookmarkFailureAction;

// ACTION CREATORS

export const actionCreators = {
    fetchBookmarks: () =>
        createPromiseAction({
            startType: ActionType.FETCH_BOOKMARKS,
            successType: ActionType.FETCH_BOOKMARKS_SUCCESS,
            failureType: ActionType.FETCH_BOOKMARKS_FAILURE,
            promise: () => pocketApi.retrieve({}).then(p => <FetchBookmarksResponse>p)
        }),

    removeBookmark: (key: string) =>
        createPromiseAction({
            startType: ActionType.REMOVE_BOOKMARK,
            successType: ActionType.REMOVE_BOOKMARK_SUCCESS,
            failureType: ActionType.REMOVE_BOOKMARK_FAILURE,
            promise: () => pocketApi.delete(key),
            payload: <RemoveBookmarkPayload>{
                id: key
            }
        })
};