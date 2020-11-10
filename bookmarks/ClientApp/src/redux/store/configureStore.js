"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_1 = require("redux");
const redux_thunk_1 = require("redux-thunk");
const reducer_1 = require("../root/reducer");
const promise_middleware_1 = require("../middleware/promise-middleware");
const redux_devtools_extension_1 = require("redux-devtools-extension");
const devMode = process.env.NODE_ENV === "development";
const composeEnhancers = (devMode && redux_devtools_extension_1.composeWithDevTools({})) || redux_1.compose;
const appStore = redux_1.createStore(reducer_1.default, composeEnhancers(redux_1.applyMiddleware(promise_middleware_1.promiseMiddleware(), redux_thunk_1.default)));
exports.default = appStore;
//# sourceMappingURL=configureStore.js.map