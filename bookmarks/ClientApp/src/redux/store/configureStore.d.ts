import { Action } from "redux";
import { AppState } from '../root/reducer';
declare const appStore: import("redux").Store<AppState, import("redux").AnyAction> & {
    dispatch: import("../middleware/promise-middleware").PromiseDispatch<import("redux").AnyAction> & import("redux-thunk").ThunkDispatch<AppState, undefined, Action<any>>;
};
export declare type StoreDispatch = typeof appStore.dispatch;
export default appStore;
