"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseMiddleware = exports.createPromiseAction = void 0;
/** Casts PromiseMiddlewareAction generic params. */
exports.createPromiseAction = function (action) { return action; };
function createStartAction(type, payload) {
    return { type: type, payload: payload };
}
function createSuccessAction(type, response, payload) {
    return { type: type, payload: payload, response: response };
}
function createFailureAction(type, error, payload) {
    return { type: type, payload: payload, error: String(error) };
}
function promiseMiddleware() {
    var promiseMiddleware;
    promiseMiddleware = function (_a) {
        var dispatch = _a.dispatch;
        return function (next) { return function (
        // The action passed to the dispatch
        action) {
            var _a = action, payload = _a.payload, promise = _a.promise, successType = _a.successType, failureType = _a.failureType, startType = _a.startType;
            if (typeof (promise) !== "function" || !successType) {
                return next(action);
            }
            dispatch(createStartAction(startType, payload));
            return promise().then(function (response) { return dispatch(createSuccessAction(successType, response, payload)); }, function (error) { return dispatch(createFailureAction(failureType, error, payload)); });
        }; };
    };
    return promiseMiddleware;
}
exports.promiseMiddleware = promiseMiddleware;
//# sourceMappingURL=promise-middleware.js.map