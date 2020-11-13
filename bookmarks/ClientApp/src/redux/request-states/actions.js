export var ActionType;
(function (ActionType) {
    ActionType["SET_GLOBAL_REQ_STATE"] = "request_states/SET_GLOBAL_STATE";
    ActionType["REMOVE_GLOBAL_REQ_STATE"] = "request_states/REMOVE_GLOBAL_STATE";
    ActionType["SET_BOOKMARK_REQ_STATE"] = "request_states/SET_BOOKMARK_STATE";
    ActionType["REMOVE_BOOKMARK_REQ_STATE"] = "request_states/REMOVE_BOOKMARK_STATE";
    ActionType["CLEAR"] = "request_states/CLEAR";
})(ActionType || (ActionType = {}));
// END ACTIONS
// ACTION CREATORS
export const actionCreators = {
    setGlobalRequestState: (requestType, requestState) => ({
        type: ActionType.SET_GLOBAL_REQ_STATE,
        requestType,
        requestState
    }),
    removeGlobalRequestState: (requestType) => ({
        type: ActionType.REMOVE_GLOBAL_REQ_STATE,
        requestType
    }),
    setBookmarkRequestState: (keys, requestType, requestState) => ({
        type: ActionType.SET_BOOKMARK_REQ_STATE,
        keys,
        requestType,
        requestState
    }),
    removeBookmarkRequestState: (keys, requestType) => ({
        type: ActionType.REMOVE_BOOKMARK_REQ_STATE,
        keys,
        requestType,
    }),
    clear: () => ({
        type: ActionType.CLEAR
    })
};
// END ACTION CREATORS
