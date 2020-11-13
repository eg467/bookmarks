import pocketApi from '../../../api/pocket-api';
import * as actions from './actions';
export const initialState = {
    username: pocketApi.username,
    error: "",
    loading: false,
};
const hydratedState = {
    ...initialState
};
export default function (state = hydratedState, action) {
    switch (action.type) {
        case actions.ActionType.FETCH_REQUEST_TOKEN:
        case actions.ActionType.FETCH_ACCESS_TOKEN:
            return {
                ...state,
                loading: true
            };
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
            };
        default:
            return state;
    }
}
export const selectors = {
    username: (state) => state.pocket.auth.username,
    isAuthenticated: (state) => !!state.pocket.auth.username,
};
