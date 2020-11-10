import { AnyAction, Action, Middleware } from 'redux';
import { AppState } from '../../redux/root/reducer';
export declare type PromiseMiddlewareAction<R = {}, P = {}> = {
    startType: any;
    successType: string;
    failureType?: string;
    promise: () => Promise<R>;
    payload?: P;
    clearingAction?: {
        timeoutBeforeClear: number;
        clearingType: string;
    };
};
/** Casts PromiseMiddlewareAction generic params. */
export declare const createPromiseAction: <R = {}, P = {}>(action: PromiseMiddlewareAction<R, P>) => PromiseMiddlewareAction<R, P>;
export interface StartPromiseAction<A, P> extends Action<A> {
    payload: P;
}
export interface PromiseSuccessAction<A, R, P> extends StartPromiseAction<A, P> {
    response: R;
}
export interface PromiseFailureAction<A, P> extends StartPromiseAction<A, P> {
    error: string;
}
export interface PromiseClearingAction<A, C, P> extends StartPromiseAction<A, P> {
    callingType: C;
}
export declare function createStartPromiseAction<A, P>(type: A, payload: P): StartPromiseAction<A, P>;
export declare function createSuccessPromiseAction<A, P, R>(type: A, response: R, payload: P): PromiseSuccessAction<A, R, P>;
export declare function createFailurePromiseAction<A, P>(type: A, error: any, payload: P): PromiseFailureAction<A, P>;
/**
 * Promise middleware adds support for dispatching promises.
 */
export declare type PromiseDispatch<A extends AnyAction> = {
    <T extends A>(action: T): T;
    <A, R, P>(action: PromiseMiddlewareAction<R, P>): Promise<PromiseSuccessAction<A, R, P>>;
};
export declare type PromiseMiddleware<D = {}, S = {}, A extends Action = AnyAction> = Middleware<PromiseDispatch<A> | D, S, PromiseDispatch<A>>;
export declare function promiseMiddleware(): PromiseMiddleware<PromiseDispatch<AnyAction>, AppState, AnyAction>;
