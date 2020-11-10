"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseMiddleware = exports.createFailurePromiseAction = exports.createSuccessPromiseAction = exports.createStartPromiseAction = exports.createPromiseAction = void 0;
/** Casts PromiseMiddlewareAction generic params. */
exports.createPromiseAction = (action) => action;
function createStartPromiseAction(type, payload) {
    return { type, payload };
}
exports.createStartPromiseAction = createStartPromiseAction;
function createSuccessPromiseAction(type, response, payload) {
    return { type, payload, response };
}
exports.createSuccessPromiseAction = createSuccessPromiseAction;
function createFailurePromiseAction(type, error, payload) {
    return { type, payload, error: String(error) };
}
exports.createFailurePromiseAction = createFailurePromiseAction;
function createClearingAction(type, callingType, payload) {
    return { type, callingType, payload };
}
function promiseMiddleware() {
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
exports.promiseMiddleware = promiseMiddleware;
//# sourceMappingURL=promise-middleware.js.map