import pocketApi from "../../../api/pocket-api";
import { AppState } from "../../root/reducer";
import * as actions from "./actions";

export interface PocketAuthState {
   username: string;
   error: string;
   loading: boolean;
}

export const initialState: PocketAuthState = {
   username: pocketApi.username,
   error: "",
   loading: false,
};

export default function (
   state = initialState,
   action: actions.PocketAuthActionTypes,
): PocketAuthState {
   switch (action.type) {
      case actions.ActionType.LOGIN:
         return {
            ...state,
            username: "",
            loading: true,
            error: "",
         };

      case actions.ActionType.LOGIN_SUCCESS:
         return {
            ...state,
            username: action.response.username,
            loading: false,
            error: "",
         };

      case actions.ActionType.LOGIN_FAILURE:
         return {
            ...state,
            username: "",
            loading: false,
            error: action.error,
         };
         
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
   username: (state: AppState) => state.pocket.auth.username,
   isAuthenticated: (state: AppState) => !!state.pocket.auth.username,
};
