import { BookmarkKeys } from "../../api/bookmark-io";
import { NullAction } from "../common/actions";
import { RequestState, RequestType } from "./reducer";
export declare enum ActionType {
    SET_GLOBAL_REQ_STATE = "request_states/SET_GLOBAL_STATE",
    REMOVE_GLOBAL_REQ_STATE = "request_states/REMOVE_GLOBAL_STATE",
    SET_BOOKMARK_REQ_STATE = "request_states/SET_BOOKMARK_STATE",
    REMOVE_BOOKMARK_REQ_STATE = "request_states/REMOVE_BOOKMARK_STATE",
    CLEAR = "request_states/CLEAR"
}
export declare type SetGlobalReqStateAction = {
    type: ActionType.SET_GLOBAL_REQ_STATE;
    requestType: RequestType;
    requestState: RequestState;
};
export declare type RemoveGlobalReqStateAction = {
    type: ActionType.REMOVE_GLOBAL_REQ_STATE;
    requestType: RequestType;
};
export declare type SetBookmarkReqStateAction = {
    type: ActionType.SET_BOOKMARK_REQ_STATE;
    keys: BookmarkKeys;
    requestType: RequestType;
    requestState: RequestState;
};
export declare type RemoveBookmarkReqStateAction = {
    type: ActionType.REMOVE_BOOKMARK_REQ_STATE;
    keys: BookmarkKeys;
    requestType: RequestType;
};
export declare type ClearRequestStatesAction = {
    type: ActionType.CLEAR;
};
export declare type RequestStateAction = SetGlobalReqStateAction | RemoveGlobalReqStateAction | SetBookmarkReqStateAction | RemoveBookmarkReqStateAction | ClearRequestStatesAction | NullAction;
export declare const actionCreators: {
    setGlobalRequestState: (requestType: RequestType, requestState: RequestState) => SetGlobalReqStateAction;
    removeGlobalRequestState: (requestType: RequestType) => RemoveGlobalReqStateAction;
    setBookmarkRequestState: (keys: BookmarkKeys, requestType: RequestType, requestState: RequestState) => SetBookmarkReqStateAction;
    removeBookmarkRequestState: (keys: BookmarkKeys, requestType: RequestType) => RemoveBookmarkReqStateAction;
    clear: () => ClearRequestStatesAction;
};
