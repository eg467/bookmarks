import { AnyAction, Action, Middleware, MiddlewareAPI } from 'redux';
import { AppState } from '../../redux/root/reducer';

export type PromiseMiddlewareAction<R = {}, P = {}> = {
    startType: any,
    successType: string,
    failureType?: string,
    promise: () => Promise<R>,
    payload?: P,
    clearingAction?: {
        timeoutBeforeClear: number
        clearingType: string,
    }
};

/** Casts PromiseMiddlewareAction generic params. */
export const createPromiseAction = <R = {}, P = {}>(action: PromiseMiddlewareAction<R, P>) => action;

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
    callingType: C
}

export function createStartPromiseAction<A, P>(type: A, payload: P) {
    return { type, payload } as StartPromiseAction<A, P>;
}

export function createSuccessPromiseAction<A, P, R>(type: A, response: R, payload: P) {
    return { type, payload, response } as PromiseSuccessAction<A, R, P>;
}

export function createFailurePromiseAction<A, P>(type: A, error: any, payload: P) {
    return { type, payload, error: String(error) } as PromiseFailureAction<A, P>;
}

function createClearingAction<A, C, P>(type: A, callingType: C, payload: P) {
    return { type, callingType, payload } as PromiseClearingAction<A, C, P>;
}

/**
 * Promise middleware adds support for dispatching promises.
 */

export type PromiseDispatch<A extends AnyAction> = {
    <T extends A>(action: T): T;
    <A, R, P>(action: PromiseMiddlewareAction<R, P>): Promise<PromiseSuccessAction<A, R, P>>;
};

export type PromiseMiddleware<D = {}, S = {}, A extends Action = AnyAction> = Middleware<PromiseDispatch<A> | D, S, PromiseDispatch<A>>;

export function promiseMiddleware() {
    let promiseMiddleware: PromiseMiddleware<PromiseDispatch<AnyAction>, AppState>;

    promiseMiddleware = ({ dispatch }: MiddlewareAPI) => next => <R, P>(
        // The action passed to the dispatch
        action: AnyAction | PromiseMiddlewareAction<R, P>
    ) => {
        const { payload, promise, successType, failureType, clearingAction, startType } =
            action as PromiseMiddlewareAction<R, P>;

        if (typeof (promise) !== "function" || !successType) {
            return next(action as AnyAction);
        }

        // Start the ball rolling, going into the pending state
        dispatch(createStartPromiseAction(startType, payload));

        return promise().then(
            (response: R) => {
                const successAction = dispatch(createSuccessPromiseAction(successType, response, payload));
                addTimerIfNeeded(successType);
                return successAction;
            },
            (error: any) => {
                if (!failureType) {
                    return Promise.reject(error);
                }

                const failureAction = dispatch(createFailurePromiseAction(failureType, error, payload));
                addTimerIfNeeded(failureType);
                return failureAction;
            }
        );

        function addTimerIfNeeded(callingType: string) {
            if (!clearingAction) {
                return;
            }
            const { clearingType, timeoutBeforeClear } = clearingAction;
            setTimeout(() => {
                dispatch(createClearingAction(clearingType, callingType, payload));
            }, timeoutBeforeClear);
        }
    }

    return promiseMiddleware
}