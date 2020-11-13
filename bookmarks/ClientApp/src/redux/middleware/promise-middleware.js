/** Casts PromiseMiddlewareAction generic params. */
export const createPromiseAction = (action) => action;
export function createStartPromiseAction(type, payload) {
    return { type, payload };
}
export function createSuccessPromiseAction(type, response, payload) {
    return { type, payload, response };
}
export function createFailurePromiseAction(type, error, payload) {
    return { type, payload, error: String(error) };
}
function createClearingAction(type, callingType, payload) {
    return { type, callingType, payload };
}
export function promiseMiddleware() {
    let promiseMiddleware;
    promiseMiddleware = ({ dispatch }) => next => (
    // The action passed to the dispatch
    action) => {
        const { payload, promise, successType, failureType, clearingAction, startType } = action;
        if (typeof (promise) !== "function" || !successType) {
            return next(action);
        }
        // Start the ball rolling, going into the pending state
        dispatch(createStartPromiseAction(startType, payload));
        return promise().then((response) => {
            const successAction = dispatch(createSuccessPromiseAction(successType, response, payload));
            addTimerIfNeeded(successType);
            return successAction;
        }, (error) => {
            if (!failureType) {
                return Promise.reject(error);
            }
            const failureAction = dispatch(createFailurePromiseAction(failureType, error, payload));
            addTimerIfNeeded(failureType);
            return failureAction;
        });
        function addTimerIfNeeded(callingType) {
            if (!clearingAction) {
                return;
            }
            const { clearingType, timeoutBeforeClear } = clearingAction;
            setTimeout(() => {
                dispatch(createClearingAction(clearingType, callingType, payload));
            }, timeoutBeforeClear);
        }
    };
    return promiseMiddleware;
}
