import pocketApi from "../../../api/pocket-api";
import { createPromiseAction } from "../../middleware/promise-middleware";
import { BookmarkSourceType } from "../../bookmarks/reducer";
export var ActionType;
(function (ActionType) {
    ActionType["FETCH_BOOKMARKS"] = "pocket/bookmarks/FETCH_BOOKMARKS";
    ActionType["FETCH_BOOKMARKS_SUCCESS"] = "pocket/bookmarks/FETCH_BOOKMARKS_SUCCESS";
    ActionType["FETCH_BOOKMARKS_FAILURE"] = "pocket/bookmarks/FETCH_BOOKMARKS_FAILURE";
    ActionType["REMOVE_BOOKMARK"] = "pocket/bookmarks/REMOVE_BOOKMARK";
    ActionType["REMOVE_BOOKMARK_SUCCESS"] = "pocket/bookmarks/REMOVE_BOOKMARK_SUCCESS";
    ActionType["REMOVE_BOOKMARK_FAILURE"] = "pocket/bookmarks/REMOVE_BOOKMARK_FAILURE";
})(ActionType || (ActionType = {}));
// ACTION CREATORS
export const actionCreators = {
    fetchBookmarks: () => createPromiseAction({
        startType: ActionType.FETCH_BOOKMARKS,
        successType: ActionType.FETCH_BOOKMARKS_SUCCESS,
        failureType: ActionType.FETCH_BOOKMARKS_FAILURE,
        promise: () => pocketApi.retrieve({})
            .then(bookmarks => ({ bookmarks, source: { description: "Pocket", type: BookmarkSourceType.pocket } }))
    }),
};
