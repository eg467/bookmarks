"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionCreators = exports.ActionType = void 0;
const promise_middleware_1 = require("../middleware/promise-middleware");
const reducer_1 = require("./reducer");
var ActionType;
(function (ActionType) {
    ActionType["SHOW"] = "bookmarks/SHOW";
    ActionType["ADD"] = "bookmarks/ADD";
    ActionType["ADD_SUCCESS"] = "bookmarks/ADD_SUCCESS";
    ActionType["ADD_FAILURE"] = "bookmarks/ADD_FAILURE";
    ActionType["ADD_CLEAR"] = "bookmarks/ADD_CLEAR";
    ActionType["REMOVE"] = "bookmarks/REMOVE";
    ActionType["REMOVE_SUCCESS"] = "bookmarks/REMOVE_SUCCESS";
    ActionType["REMOVE_FAILURE"] = "bookmarks/REMOVE_FAILURE";
    ActionType["REMOVE_CLEAR"] = "bookmarks/REMOVE_CLEAR";
    ActionType["ARCHIVE"] = "bookmarks/ARCHIVE";
    ActionType["ARCHIVE_SUCCESS"] = "bookmarks/ARCHIVE_SUCCESS";
    ActionType["ARCHIVE_FAILURE"] = "bookmarks/ARCHIVE_FAILURE";
    ActionType["ARCHIVE_CLEAR"] = "bookmarks/ARCHIVE_CLEAR";
    ActionType["FAVORITE"] = "bookmarks/FAVORITE";
    ActionType["FAVORITE_SUCCESS"] = "bookmarks/FAVORITE_SUCCESS";
    ActionType["FAVORITE_FAILURE"] = "bookmarks/FAVORITE_FAILURE";
    ActionType["FAVORITE_CLEAR"] = "bookmarks/FAVORITE_CLEAR";
    ActionType["MODIFY_TAGS"] = "bookmarks/MODIFY_TAGS";
    ActionType["MODIFY_TAGS_SUCCESS"] = "bookmarks/MODIFY_TAGS_SUCCESS";
    ActionType["MODIFY_TAGS_FAILURE"] = "bookmarks/MODIFY_TAGS_FAILURE";
    ActionType["MODIFY_TAGS_CLEAR"] = "bookmarks/MODIFY_TAGS_CLEAR";
    ActionType["RENAME_TAG"] = "bookmarks/RENAME_TAG";
    ActionType["RENAME_TAG_SUCCESS"] = "bookmarks/RENAME_TAG_SUCCESS";
    ActionType["RENAME_TAG_FAILURE"] = "bookmarks/RENAME_TAG_FAILURE";
    ActionType["RENAME_TAG_CLEAR"] = "bookmarks/RENAME_TAG_CLEAR";
    ActionType["DELETE_TAG"] = "bookmarks/DELETE_TAG";
    ActionType["DELETE_TAG_SUCCESS"] = "bookmarks/DELETE_TAG_SUCCESS";
    ActionType["DELETE_TAG_FAILURE"] = "bookmarks/DELETE_TAG_FAILURE";
    ActionType["DELETE_TAG_CLEAR"] = "bookmarks/DELETE_TAG_CLEAR";
    ActionType["SORT"] = "bookmarks/SORT";
    ActionType["FILTER_AND_TAGS"] = "bookmarks/FILTER_AND_TAGS";
    ActionType["FILTER_OR_TAGS"] = "bookmarks/FILTER_OR_TAGS";
    ActionType["FILTER_NOT_TAGS"] = "bookmarks/FILTER_NOT_TAGS";
    ActionType["FILTER_CONTENT"] = "bookmarks/FILTER_CONTENT";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
// END ACTIONS
// ACTION CREATORS
const getPersister = (getState) => reducer_1.selectors.selectBookmarkPersister(getState());
exports.actionCreators = {
    showBookmarks: (bookmarks, source) => ({
        type: ActionType.SHOW,
        bookmarks,
        source
    }),
    sortBookmarks: (field, ascendingOrder = true) => ({
        type: ActionType.SORT,
        field,
        ascendingOrder
    }),
    setAndFilter: (tags) => ({ type: ActionType.FILTER_AND_TAGS, tags }),
    setOrFilter: (tags) => ({ type: ActionType.FILTER_OR_TAGS, tags }),
    setNotFilter: (tags) => ({ type: ActionType.FILTER_NOT_TAGS, tags }),
    get add() {
        return (bookmarks) => {
            return async (dispatch, getState) => {
                const persister = getPersister(getState);
                await dispatch(promise_middleware_1.createPromiseAction({
                    startType: ActionType.ADD,
                    successType: ActionType.ADD_SUCCESS,
                    failureType: ActionType.ADD_FAILURE,
                    promise: () => (persister && persister.add)
                        ? persister.add(bookmarks)
                        : Promise.reject(Error("Unsupported bookmark operation.")),
                    payload: { bookmarks }
                })).catch(e => {
                    // TODO: Add user error notifications in UI & Redux state.
                    console.error(e);
                });
                // Refresh the page after adding new bookmarks.
                // (Sometimes API responses to adding new bookmarks)
                if (persister.refresh) {
                    const newBookmarks = await persister.refresh();
                    var source = reducer_1.selectors.selectBookmarkSource(getState());
                    dispatch(this.showBookmarks(newBookmarks, source));
                }
            };
        };
    },
    remove: (keys) => {
        return async (dispatch, getState) => {
            const persister = getPersister(getState);
            await dispatch(promise_middleware_1.createPromiseAction({
                startType: ActionType.REMOVE,
                successType: ActionType.REMOVE_SUCCESS,
                failureType: ActionType.REMOVE_FAILURE,
                promise: () => persister.remove
                    ? persister.remove(keys)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: { keys }
            }));
        };
    },
    archive: (keys, status) => {
        return async (dispatch, getState) => {
            const persister = getPersister(getState);
            await dispatch(promise_middleware_1.createPromiseAction({
                startType: ActionType.ARCHIVE,
                successType: ActionType.ARCHIVE_SUCCESS,
                failureType: ActionType.ARCHIVE_FAILURE,
                promise: () => persister.archive
                    ? persister.archive(keys, status)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: { keys }
            }));
        };
    },
    favorite: (input) => {
        return async (dispatch, getState) => {
            const persister = getPersister(getState);
            const { keys, status } = input;
            await dispatch(promise_middleware_1.createPromiseAction({
                startType: ActionType.FAVORITE,
                successType: ActionType.FAVORITE_SUCCESS,
                failureType: ActionType.FAVORITE_FAILURE,
                promise: () => persister.favorite
                    ? persister.favorite(keys, status)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: input
            }));
        };
    },
    modifyTags: (input) => {
        return async (dispatch, getState) => {
            const persister = getPersister(getState);
            const { keys, tags, operation } = input;
            await dispatch(promise_middleware_1.createPromiseAction({
                startType: ActionType.MODIFY_TAGS,
                successType: ActionType.MODIFY_TAGS_SUCCESS,
                failureType: ActionType.MODIFY_TAGS_FAILURE,
                promise: () => persister.modifyTags
                    ? persister.modifyTags(keys, tags, operation)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: input
            }));
        };
    },
    renameTag: (input) => {
        return async (dispatch, getState) => {
            const persister = getPersister(getState);
            const { newTag, oldTag } = input;
            await dispatch(promise_middleware_1.createPromiseAction({
                startType: ActionType.RENAME_TAG,
                successType: ActionType.RENAME_TAG_SUCCESS,
                failureType: ActionType.RENAME_TAG_FAILURE,
                promise: () => persister.renameTag
                    ? persister.renameTag(oldTag, newTag)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: input
            }));
        };
    },
    deleteTag: (input) => {
        return async (dispatch, getState) => {
            const persister = getPersister(getState);
            const { tag } = input;
            await dispatch(promise_middleware_1.createPromiseAction({
                startType: ActionType.DELETE_TAG,
                successType: ActionType.DELETE_TAG_SUCCESS,
                failureType: ActionType.DELETE_TAG_FAILURE,
                promise: () => persister.deleteTag
                    ? persister.deleteTag(tag)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: input
            }));
        };
    }
};
// END ACTION CREATORS
//# sourceMappingURL=actions.js.map