"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionCreators = exports.ActionType = void 0;
const pocket_api_1 = require("../../../api/pocket-api");
const promise_middleware_1 = require("../../middleware/promise-middleware");
const reducer_1 = require("../../bookmarks/reducer");
var ActionType;
(function (ActionType) {
    ActionType["FETCH_BOOKMARKS"] = "pocket/bookmarks/FETCH_BOOKMARKS";
    ActionType["FETCH_BOOKMARKS_SUCCESS"] = "pocket/bookmarks/FETCH_BOOKMARKS_SUCCESS";
    ActionType["FETCH_BOOKMARKS_FAILURE"] = "pocket/bookmarks/FETCH_BOOKMARKS_FAILURE";
    ActionType["REMOVE_BOOKMARK"] = "pocket/bookmarks/REMOVE_BOOKMARK";
    ActionType["REMOVE_BOOKMARK_SUCCESS"] = "pocket/bookmarks/REMOVE_BOOKMARK_SUCCESS";
    ActionType["REMOVE_BOOKMARK_FAILURE"] = "pocket/bookmarks/REMOVE_BOOKMARK_FAILURE";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
// ACTION CREATORS
exports.actionCreators = {
    fetchBookmarks: () => promise_middleware_1.createPromiseAction({
        startType: ActionType.FETCH_BOOKMARKS,
        successType: ActionType.FETCH_BOOKMARKS_SUCCESS,
        failureType: ActionType.FETCH_BOOKMARKS_FAILURE,
        promise: () => pocket_api_1.default.retrieve({}).then(bookmarks => ({ bookmarks, source: { description: "Pocket", type: reducer_1.BookmarkSourceType.pocket } }))
    }),
};
//# sourceMappingURL=actions.js.map