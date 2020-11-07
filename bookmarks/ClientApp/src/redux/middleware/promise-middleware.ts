import { AnyAction, Action, Middleware, MiddlewareAPI } from 'redux';
import { AppState } from '../../redux/root/reducer';

export type PromiseMiddlewareAction<T = {}, R = {}, P = {}> = {
    startType: any,
    successType: string,
    failureType: any,
    promise: () => Promise<R>,
    payload?: P
};

/** Casts PromiseMiddlewareAction generic params. */
export const createPromiseAction = <A = {}, R = {}, P = {}>(action: PromiseMiddlewareAction<A, R, P>) => action;

export interface StartPromiseAction<A, P> extends Action<A> {
    payload: P;
}

export interface PromiseSuccessAction<A, R, P> extends StartPromiseAction<A, P> {
    response: R;
}

export interface PromiseFailureAction<A, P> extends StartPromiseAction<A, P> {
    error: string;
}

function createStartAction<A, P>(type: A, payload: P) {
    return { type, payload } as StartPromiseAction<A, P>;
}

function createSuccessAction<A, P, R>(type: A, response: R, payload: P) {
    return { type, payload, response } as PromiseSuccessAction<A, R, P>;
}

function createFailureAction<A, P>(type: A, error: any, payload: P) {
    return { type, payload, error: String(error) } as PromiseFailureAction<A, P>;
}

/**
 * Promise middleware adds support for dispatching promises.
 */

export type PromiseDispatch<A extends AnyAction> = {
    <T extends A>(action: T): T;
    <A, R, P>(action: PromiseMiddlewareAction<A, R, P>): Promise<PromiseSuccessAction<A, R, P>>;
};

export type PromiseMiddleware<D = {}, S = {}, A extends Action = AnyAction> = Middleware<PromiseDispatch<A> | D, S, PromiseDispatch<A>>;

export function promiseMiddleware() {
    let promiseMiddleware: PromiseMiddleware<PromiseDispatch<AnyAction>, AppState>;

    promiseMiddleware = ({ dispatch }: MiddlewareAPI) => next => <A, R, P>(
        // The action passed to the dispatch
        action: AnyAction | PromiseMiddlewareAction<A, R, P>
    ) => {
        const { payload, promise, successType, failureType, startType } = action as PromiseMiddlewareAction<A, R, P>;

        if (typeof (promise) !== "function" || !successType) {
            return next(action as AnyAction);
        }

        dispatch(createStartAction(startType, payload));

        return promise().then(
            (response: R) => dispatch(createSuccessAction(successType, response, payload)),
            (error: any) => dispatch(createFailureAction(failureType, error, payload))
        )
    }

    return promiseMiddleware
}