import { AppState } from '../root/reducer';
import pocketApi from "../../api/pocket-api";
import * as actions from "./actions";

export type PocketState = {
    username: string;
    authError: string;
    fetchError: string;
    fetchingBookmarks: boolean;
    awaitingAuthorization: boolean;
}

export const initialState: PocketState = {
    username: pocketApi.username,
    authError: "",
    fetchError: "",
    fetchingBookmarks: false,
    awaitingAuthorization: false
};


export default function (
   state = initialState,
   action: actions.PocketAction,
): PocketState {
    switch (action.type) {
        case actions.ActionType.LOGIN:
            return {
                ...state,
                username: "",
                fetchingBookmarks: false,
                authError: "",
                awaitingAuthorization: true,
            };

        case actions.ActionType.LOGIN_SUCCESS:
            return {
                ...state,
                username: action.response.username,
                fetchingBookmarks: false,
                authError: "",
                awaitingAuthorization: false,
            };

        case actions.ActionType.LOGIN_FAILURE:
            return {
                ...state,
                username: "",
                fetchingBookmarks: false,
                authError: action.error,
                awaitingAuthorization: false,
            };

        case actions.ActionType.LOGOUT:
            return { ...initialState };

        case actions.ActionType.REFRESH_AUTH_STATE:
            return {
                ...state,
                username: action.username,
            };

        case actions.ActionType.FETCH_BOOKMARKS:
            return {
                ...state,
                fetchingBookmarks: true,
                fetchError: "",
            };
        case actions.ActionType.FETCH_BOOKMARKS_SUCCESS:
            return {
                ...state,
                fetchingBookmarks: false,
                fetchError: "",
            };
        case actions.ActionType.FETCH_BOOKMARKS_FAILURE:
            return {
                ...state,
                fetchingBookmarks: false,
                fetchError: action.error,
            };

        default:
            return state;
    }
}

export const selectors = {
    username: (state: AppState) => state.pocket.username,
    isAuthorizing: (state: AppState) => state.pocket.awaitingAuthorization,
    isAuthenticated: (state: AppState) => !!state.pocket.username,
    isFetching: (state: AppState) => state.pocket.fetchingBookmarks,
    fetchError: (state: AppState) => state.pocket.fetchError,
};

