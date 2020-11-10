"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectors = exports.readRequestState = exports.RequestType = exports.RequestStateType = exports.makeReqState = void 0;
const immer_1 = require("immer");
const reselect_1 = require("reselect");
const bookmark_io_1 = require("../../api/bookmark-io");
const actions_1 = require("../bookmarks/actions");
const actions_2 = require("./actions");
exports.makeReqState = {
    pending: () => ({ state: RequestStateType.pending }),
    success: () => ({ state: RequestStateType.success }),
    error: (message) => ({ state: RequestStateType.error, error: message }),
    clear: () => ({ state: RequestStateType.inactive }),
};
var RequestStateType;
(function (RequestStateType) {
    RequestStateType[RequestStateType["inactive"] = 0] = "inactive";
    RequestStateType[RequestStateType["error"] = 1] = "error";
    RequestStateType[RequestStateType["success"] = 2] = "success";
    RequestStateType[RequestStateType["pending"] = 3] = "pending";
})(RequestStateType = exports.RequestStateType || (exports.RequestStateType = {}));
;
// Remember to add these as new operations are added.
var RequestType;
(function (RequestType) {
    RequestType[RequestType["add"] = 0] = "add";
    RequestType[RequestType["remove"] = 1] = "remove";
    RequestType[RequestType["archive"] = 2] = "archive";
    RequestType[RequestType["favorite"] = 3] = "favorite";
    RequestType[RequestType["modifyTags"] = 4] = "modifyTags";
    RequestType[RequestType["renameTag"] = 5] = "renameTag";
    RequestType[RequestType["deleteTag"] = 6] = "deleteTag";
})(RequestType = exports.RequestType || (exports.RequestType = {}));
const initialState = {
    byBookmark: {},
    bulkRequests: {}
};
exports.default = immer_1.default((state, action) => {
    switch (action.type) {
        // NOTE: THIS SWITCH REQUIRES (REQUEST_<SUCCESS|CLEAR|FAILURE>) ACTION NAMING CONVENTION.
        case actions_1.ActionType.ADD:
        case actions_1.ActionType.ADD_SUCCESS:
        case actions_1.ActionType.ADD_CLEAR:
            return changeGlobalReqState(RequestType.add);
        case actions_1.ActionType.ADD_FAILURE:
            return changeGlobalReqState(RequestType.add, action.error);
        case actions_1.ActionType.REMOVE:
        case actions_1.ActionType.REMOVE_SUCCESS:
        case actions_1.ActionType.REMOVE_CLEAR:
            return changeGlobalReqState(RequestType.remove);
        case actions_1.ActionType.REMOVE_FAILURE:
            return changeGlobalReqState(RequestType.remove, action.error);
        case actions_1.ActionType.ARCHIVE:
        case actions_1.ActionType.ARCHIVE_SUCCESS:
        case actions_1.ActionType.ARCHIVE_CLEAR:
            return changeBookmarkReqState(action.payload.keys, RequestType.archive);
        case actions_1.ActionType.ARCHIVE_FAILURE:
            return changeBookmarkReqState(action.payload.keys, RequestType.archive, action.error);
        case actions_1.ActionType.FAVORITE:
        case actions_1.ActionType.FAVORITE_SUCCESS:
        case actions_1.ActionType.FAVORITE_CLEAR:
            return changeBookmarkReqState(action.payload.keys, RequestType.favorite);
        case actions_1.ActionType.FAVORITE_FAILURE:
            return changeBookmarkReqState(action.payload.keys, RequestType.favorite, action.error);
        case actions_1.ActionType.MODIFY_TAGS:
        case actions_1.ActionType.MODIFY_TAGS_SUCCESS:
        case actions_1.ActionType.MODIFY_TAGS_CLEAR:
            return changeBookmarkReqState(action.payload.keys, RequestType.modifyTags);
        case actions_1.ActionType.MODIFY_TAGS_FAILURE:
            return changeBookmarkReqState(action.payload.keys, RequestType.modifyTags, action.error);
        case actions_1.ActionType.RENAME_TAG:
        case actions_1.ActionType.RENAME_TAG_SUCCESS:
        case actions_1.ActionType.RENAME_TAG_CLEAR:
            return changeGlobalReqState(RequestType.renameTag);
        case actions_1.ActionType.RENAME_TAG_FAILURE:
            return changeGlobalReqState(RequestType.renameTag, action.error);
        case actions_1.ActionType.DELETE_TAG:
        case actions_1.ActionType.DELETE_TAG_SUCCESS:
        case actions_1.ActionType.DELETE_TAG_CLEAR:
            return changeGlobalReqState(RequestType.deleteTag);
        case actions_1.ActionType.DELETE_TAG_FAILURE:
            return changeGlobalReqState(RequestType.deleteTag, action.error);
        // ACTIONS SPECIFICALLY FOR THIS REDUCER
        // Use naming convention where success flagging actions
        case actions_2.ActionType.CLEAR:
            {
                state = initialState;
                break;
            }
        case actions_2.ActionType.SET_BOOKMARK_REQ_STATE:
            {
                const { keys, requestType, requestState } = action;
                bookmark_io_1.toArray(keys).forEach(key => {
                    state.byBookmark[key][requestType] = requestState;
                });
                break;
            }
        case actions_2.ActionType.REMOVE_BOOKMARK_REQ_STATE:
            {
                const { keys, requestType } = action;
                bookmark_io_1.toArray(keys).forEach(key => {
                    delete state.byBookmark[key][requestType];
                });
                break;
            }
        case actions_2.ActionType.SET_GLOBAL_REQ_STATE:
            {
                const { requestType, requestState } = action;
                state.bulkRequests[requestType] = requestState;
                break;
            }
        case actions_2.ActionType.REMOVE_GLOBAL_REQ_STATE:
            {
                const { requestType } = action;
                delete state.bulkRequests[requestType];
                break;
            }
    }
    /**
    * Relies on action type naming convention where corresponding types end in:
    * 'SUCCESS', 'CLEAR', and a variably ending pending state.
    * @param container
    * @param requestType
    */
    function setReqStateInContainer(container, requestType, error) {
        // Use naming convention to avoid boilerplate typing.
        const actionType = action.type.toUpperCase();
        if (actionType.endsWith("SUCCESS")) {
            container[requestType] = exports.makeReqState.success();
        }
        else if (actionType.endsWith("CLEAR")) {
            delete container[requestType];
        }
        else if (actionType.endsWith("FAILURE")) {
            container[requestType] = exports.makeReqState.error(error || "");
        }
        else {
            // ONLY LEAVE PENDING
            container[requestType] = exports.makeReqState.pending();
        }
        return true;
    }
    function changeBookmarkReqState(keys, requestType, error) {
        for (let key of bookmark_io_1.toArray(keys)) {
            const container = state.byBookmark[key] = state.byBookmark[key] || {};
            setReqStateInContainer(container, requestType, error);
            if (Object.keys(container).length === 0) {
                delete state.byBookmark[key];
            }
        }
        return true;
    }
    function changeGlobalReqState(requestType, error) {
        // Use naming convention to avoid boilerplate typing.
        return setReqStateInContainer(state.bulkRequests, requestType, error);
    }
}, initialState);
// HISTORY / REQUEST STATE SELECTORS
const selectRequestStates = (state) => state.bookmarks.requestStates;
const selectRequestStatesByBookmark = (state) => state.bookmarks.requestStates.byBookmark;
const selectBulkRequestStates = (state) => state.bookmarks.requestStates.bulkRequests;
const _idProp = (_, { id }) => id;
const selectRequestStatesForBookmark = reselect_1.createSelector([selectRequestStatesByBookmark, _idProp], (byBookmark, id) => {
    return byBookmark[id];
});
/**
 * Parses request status taking into account that inactive states have no entries for space saving.
 * Technically not a selector, but used to read from createSelectRequestState
 * @param states
 * @param reqType
 */
exports.readRequestState = (states, reqType) => {
    return (states || {})[reqType] || exports.makeReqState.clear();
};
const createSelectRequestState = () => {
    return reselect_1.createSelector([selectRequestStatesForBookmark, selectBulkRequestStates, _idProp], (states, bulkStates, id) => {
        return {
            states: states,
            bulkStates,
            reqStatus: (reqType) => exports.readRequestState(states, reqType)
        };
    });
};
exports.selectors = {
    selectRequestStates, selectBulkRequestStates, createSelectRequestState, selectRequestStatesByBookmark
};
//# sourceMappingURL=reducer.js.map