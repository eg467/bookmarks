import { ActionCreator, AnyAction } from "redux";
import { AddBookmarkInput, BookmarkKeys, TagModification } from "../../api/bookmark-io";
import { NullAction } from "../common/actions";
import { createPromiseAction, PromiseClearingAction, PromiseDispatch, PromiseFailureAction, PromiseMiddlewareAction, PromiseSuccessAction, StartPromiseAction } from "../middleware/promise-middleware";
import { AppState, MyThunkResult } from "../root/reducer";
import { StoreDispatch } from "../store/configureStore";
import { RequestState, RequestType } from "./reducer";

export enum ActionType {
    SET_GLOBAL_REQ_STATE = "request_states/SET_GLOBAL_STATE",
    REMOVE_GLOBAL_REQ_STATE = "request_states/REMOVE_GLOBAL_STATE",
    SET_BOOKMARK_REQ_STATE = "request_states/SET_BOOKMARK_STATE",
    REMOVE_BOOKMARK_REQ_STATE = "request_states/REMOVE_BOOKMARK_STATE",
    CLEAR = "request_states/CLEAR"
}

// ACTIONS

export type SetGlobalReqStateAction = {
    type: ActionType.SET_GLOBAL_REQ_STATE,
    requestType: RequestType,
    requestState: RequestState,
};

export type RemoveGlobalReqStateAction = {
    type: ActionType.REMOVE_GLOBAL_REQ_STATE,
    requestType: RequestType
};

export type SetBookmarkReqStateAction = {
    type: ActionType.SET_BOOKMARK_REQ_STATE,
    keys: BookmarkKeys,
    requestType: RequestType,
    requestState: RequestState,
};

export type RemoveBookmarkReqStateAction = {
    type: ActionType.REMOVE_BOOKMARK_REQ_STATE,
    keys: BookmarkKeys,
    requestType: RequestType
};

export type ClearRequestStatesAction = {
    type: ActionType.CLEAR,
};

export type RequestStateAction =
    SetGlobalReqStateAction | RemoveGlobalReqStateAction | SetBookmarkReqStateAction |
    RemoveBookmarkReqStateAction | ClearRequestStatesAction | NullAction;

// END ACTIONS

// ACTION CREATORS

export const actionCreators = {
    setGlobalRequestState: (requestType: RequestType, requestState: RequestState): SetGlobalReqStateAction => ({
        type: ActionType.SET_GLOBAL_REQ_STATE,
        requestType,
        requestState
    }),
    removeGlobalRequestState: (requestType: RequestType): RemoveGlobalReqStateAction => ({
        type: ActionType.REMOVE_GLOBAL_REQ_STATE,
        requestType
    }),

    setBookmarkRequestState: (keys: BookmarkKeys, requestType: RequestType, requestState: RequestState): SetBookmarkReqStateAction => ({
        type: ActionType.SET_BOOKMARK_REQ_STATE,
        keys,
        requestType,
        requestState
    }),
    removeBookmarkRequestState: (keys: BookmarkKeys, requestType: RequestType): RemoveBookmarkReqStateAction => ({
        type: ActionType.REMOVE_BOOKMARK_REQ_STATE,
        keys,
        requestType,
    }),
    clear: (): ClearRequestStatesAction => ({
        type: ActionType.CLEAR
    })
};

// END ACTION CREATORS