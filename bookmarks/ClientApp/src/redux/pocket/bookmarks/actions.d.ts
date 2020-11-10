import { StartPromiseAction, PromiseSuccessAction, PromiseFailureAction, PromiseMiddlewareAction } from "../../middleware/promise-middleware";
import { BookmarkCollection } from "../../../redux/bookmarks/bookmarks";
import { BookmarkSource } from "../../bookmarks/reducer";
export declare enum ActionType {
    FETCH_BOOKMARKS = "pocket/bookmarks/FETCH_BOOKMARKS",
    FETCH_BOOKMARKS_SUCCESS = "pocket/bookmarks/FETCH_BOOKMARKS_SUCCESS",
    FETCH_BOOKMARKS_FAILURE = "pocket/bookmarks/FETCH_BOOKMARKS_FAILURE",
    REMOVE_BOOKMARK = "pocket/bookmarks/REMOVE_BOOKMARK",
    REMOVE_BOOKMARK_SUCCESS = "pocket/bookmarks/REMOVE_BOOKMARK_SUCCESS",
    REMOVE_BOOKMARK_FAILURE = "pocket/bookmarks/REMOVE_BOOKMARK_FAILURE"
}
export interface FetchBookmarksResponse {
    bookmarks: BookmarkCollection;
    source: BookmarkSource;
}
export declare type FetchBookMarksAction = StartPromiseAction<ActionType.FETCH_BOOKMARKS, void>;
export declare type FetchBookMarksSuccessAction = PromiseSuccessAction<ActionType.FETCH_BOOKMARKS_SUCCESS, FetchBookmarksResponse, void>;
export declare type FetchBookMarksFailureAction = PromiseFailureAction<ActionType.FETCH_BOOKMARKS_FAILURE, void>;
export declare type PocketBookmarksAction = FetchBookMarksAction | FetchBookMarksSuccessAction | FetchBookMarksFailureAction;
export declare const actionCreators: {
    fetchBookmarks: () => PromiseMiddlewareAction<FetchBookmarksResponse, {}>;
};
