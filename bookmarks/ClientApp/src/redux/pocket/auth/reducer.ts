import pocketApi from '../../../api/pocket-api';
import { AppState } from '../../root/reducer';
import * as actions from './actions';

export interface PocketAuthState {
    //accessToken: string;
    //requestToken: string;
    //redirectionPath: string;
    //waitingForRedirect: boolean;

    username: string;
    error: string;
    loading: boolean;
}

export const initialState: PocketAuthState = {
    username: pocketApi.username,
    error: "",
    loading: false,
};

const hydratedState: PocketAuthState = {
    ...initialState
};

export default function (state = hydratedState, action: actions.PocketAuthActionTypes): PocketAuthState {
    switch (action.type) {
        case actions.ActionType.FETCH_REQUEST_TOKEN:
        case actions.ActionType.FETCH_ACCESS_TOKEN:
            return {
                ...state,
                loading: true
            }

        case actions.ActionType.FETCH_REQUEST_TOKEN_SUCCESS:
            return {
                ...initialState
            };

        case actions.ActionType.FETCH_ACCESS_TOKEN_SUCCESS:
            return {
                ...initialState,
                username: action.response.username,
            };

        case actions.ActionType.FETCH_REQUEST_TOKEN_FAILURE:
        case actions.ActionType.FETCH_ACCESS_TOKEN_FAILURE:
            return { ...initialState, error: action.error };

        case actions.ActionType.LOGOUT:
            return { ...initialState };

        case actions.ActionType.REFRESH_AUTH_STATE:
            return {
                ...state,
                username: action.username,
            }

        default:
            return state;
    }
}

export const selectors = {
    username: (state: AppState) => state.pocket.auth.username,
    isAuthenticated: (state: AppState) => !!state.pocket.auth.username,
}