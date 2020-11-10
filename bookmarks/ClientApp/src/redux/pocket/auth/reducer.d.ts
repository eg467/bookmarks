import { AppState } from '../../root/reducer';
import * as actions from './actions';
export interface PocketAuthState {
    username: string;
    error: string;
    loading: boolean;
}
export declare const initialState: PocketAuthState;
export default function (state: PocketAuthState, action: actions.PocketAuthActionTypes): PocketAuthState;
export declare const selectors: {
    username: (state: AppState) => string;
    isAuthenticated: (state: AppState) => boolean;
};
