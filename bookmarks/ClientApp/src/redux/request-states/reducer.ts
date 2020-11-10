import { Bookmark } from '@material-ui/icons';
import produce from 'immer';
import { createSelector } from 'reselect';
import { BookmarkKeys, toArray } from '../../api/bookmark-io';
import { BookmarkAction, ActionType as bookmarkActionType } from '../bookmarks/actions';
import { PartialSuccessResult } from '../bookmarks/reducer';
import { AppState } from '../root/reducer';
import { RequestStateAction, ActionType } from './actions';

export const makeReqState = {
    pending: (): RequestState => ({ state: RequestStateType.pending }),
    success: (): RequestState => ({ state: RequestStateType.success }),
    error: (message: string): RequestState => ({ state: RequestStateType.error, error: message }),
    clear: (): RequestState => ({ state: RequestStateType.inactive }),
};

export type RequestState = {
    state: RequestStateType;
    error?: string;
}

export enum RequestStateType { inactive, error, success, pending };

// Remember to add these as new operations are added.
export enum RequestType {
    add, remove, archive, favorite, modifyTags, renameTag, deleteTag
}

export type StateByRequest = Partial<Record<RequestType, RequestState>>;

export type RequestStatesState = {
    // Actions taken to specific bookmarks.
    byBookmark: { [bookmarkId: string]: StateByRequest };
    // Global actions to an indeterminate set of bookmarks, e.g. bulk rename tags.
    bulkRequests: StateByRequest
};

const initialState: RequestStatesState = {
    byBookmark: {},
    bulkRequests: {}
};

export default produce((state: RequestStatesState, action: RequestStateAction | BookmarkAction) => {
    switch (action.type) {
        // NOTE: THIS SWITCH REQUIRES (REQUEST_<SUCCESS|CLEAR|FAILURE>) ACTION NAMING CONVENTION.
        case bookmarkActionType.ADD:
        case bookmarkActionType.ADD_SUCCESS:
        case bookmarkActionType.ADD_CLEAR:
            return changeGlobalReqState(RequestType.add);
        case bookmarkActionType.ADD_FAILURE:
            return changeGlobalReqState(RequestType.add, action.error);

        case bookmarkActionType.REMOVE:
        case bookmarkActionType.REMOVE_SUCCESS:
        case bookmarkActionType.REMOVE_CLEAR:
            return changeGlobalReqState(RequestType.remove);
        case bookmarkActionType.REMOVE_FAILURE:
            return changeGlobalReqState(RequestType.remove, action.error);

        case bookmarkActionType.ARCHIVE:
        case bookmarkActionType.ARCHIVE_SUCCESS:
        case bookmarkActionType.ARCHIVE_CLEAR:
            return changeBookmarkReqState(action.payload.keys, RequestType.archive);
        case bookmarkActionType.ARCHIVE_FAILURE:
            return changeBookmarkReqState(action.payload.keys, RequestType.archive, action.error);

        case bookmarkActionType.FAVORITE:
        case bookmarkActionType.FAVORITE_SUCCESS:
        case bookmarkActionType.FAVORITE_CLEAR:
            return changeBookmarkReqState(action.payload.keys, RequestType.favorite);
        case bookmarkActionType.FAVORITE_FAILURE:
            return changeBookmarkReqState(action.payload.keys, RequestType.favorite, action.error);

        case bookmarkActionType.MODIFY_TAGS:
        case bookmarkActionType.MODIFY_TAGS_SUCCESS:
        case bookmarkActionType.MODIFY_TAGS_CLEAR:
            return changeBookmarkReqState(action.payload.keys, RequestType.modifyTags);
        case bookmarkActionType.MODIFY_TAGS_FAILURE:
            return changeBookmarkReqState(action.payload.keys, RequestType.modifyTags, action.error);

        case bookmarkActionType.RENAME_TAG:
        case bookmarkActionType.RENAME_TAG_SUCCESS:
        case bookmarkActionType.RENAME_TAG_CLEAR:
            return changeGlobalReqState(RequestType.renameTag);
        case bookmarkActionType.RENAME_TAG_FAILURE:
            return changeGlobalReqState(RequestType.renameTag, action.error);

        case bookmarkActionType.DELETE_TAG:
        case bookmarkActionType.DELETE_TAG_SUCCESS:
        case bookmarkActionType.DELETE_TAG_CLEAR:
            return changeGlobalReqState(RequestType.deleteTag);
        case bookmarkActionType.DELETE_TAG_FAILURE:
            return changeGlobalReqState(RequestType.deleteTag, action.error);

        // ACTIONS SPECIFICALLY FOR THIS REDUCER
        // Use naming convention where success flagging actions
        case ActionType.CLEAR:
            {
                state = initialState;
                break;
            }
        case ActionType.SET_BOOKMARK_REQ_STATE:
            {
                const { keys, requestType, requestState } = action;
                toArray(keys).forEach(key => {
                    state.byBookmark[key][requestType] = requestState
                });
                break;
            }

        case ActionType.REMOVE_BOOKMARK_REQ_STATE:
            {
                const { keys, requestType } = action;
                toArray(keys).forEach(key => {
                    delete state.byBookmark[key][requestType];
                });
                break;
            }

        case ActionType.SET_GLOBAL_REQ_STATE:
            {
                const { requestType, requestState } = action;
                state.bulkRequests[requestType] = requestState;
                break;
            }

        case ActionType.REMOVE_GLOBAL_REQ_STATE:
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
    function setReqStateInContainer(container: StateByRequest, requestType: RequestType, error?: string) {
        // Use naming convention to avoid boilerplate typing.
        const actionType = action.type.toUpperCase();

        if (actionType.endsWith("SUCCESS")) {
            container[requestType] = makeReqState.success();
        } else if (actionType.endsWith("CLEAR")) {
            delete container[requestType];
        } else if (actionType.endsWith("FAILURE")) {
            container[requestType] = makeReqState.error(error || "");
        } else {
            // ONLY LEAVE PENDING
            container[requestType] = makeReqState.pending();
        }
        return true;
    }

    function changeBookmarkReqState(keys: BookmarkKeys, requestType: RequestType, error?: string) {
        for (let key of toArray(keys)) {
            const container = state.byBookmark[key] = state.byBookmark[key] || {};
            setReqStateInContainer(container, requestType, error);
            if (Object.keys(container).length === 0) {
                delete state.byBookmark[key];
            }
        }

        return true;
    }

    function changeGlobalReqState(requestType: RequestType, error?: string) {
        // Use naming convention to avoid boilerplate typing.
        return setReqStateInContainer(state.bulkRequests, requestType, error);
    }
}, initialState);

// HISTORY / REQUEST STATE SELECTORS

const selectRequestStates = (state: AppState) => state.bookmarks.requestStates;
const selectRequestStatesByBookmark = (state: AppState) => state.bookmarks.requestStates.byBookmark;
const selectBulkRequestStates = (state: AppState) => state.bookmarks.requestStates.bulkRequests;
const _idProp = (_: AppState, { id }: { id: string }) => id;
const selectRequestStatesForBookmark = createSelector([selectRequestStatesByBookmark, _idProp], (byBookmark, id) => {
    return byBookmark[id];
});

/**
 * Parses request status taking into account that inactive states have no entries for space saving.
 * Technically not a selector, but used to read from createSelectRequestState
 * @param states
 * @param reqType
 */
export const readRequestState = (states: StateByRequest | undefined, reqType: RequestType): RequestState => {
    return (states || {})[reqType] || makeReqState.clear();
}

const createSelectRequestState = () => {
    return createSelector(
        [selectRequestStatesForBookmark, selectBulkRequestStates, _idProp],
        (states, bulkStates, id) => {
            return {
                states: states,
                bulkStates,
                reqStatus: (reqType: RequestType) => readRequestState(states, reqType)
            };
        });
};

export const selectors = {
    selectRequestStates, selectBulkRequestStates, createSelectRequestState, selectRequestStatesByBookmark
};