"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectors = void 0;
const redux_1 = require("redux");
const reducer_1 = require("./auth/reducer");
const reducer_2 = require("./bookmarks/reducer");
const pocketReducer = redux_1.combineReducers({
    auth: reducer_1.default, bookmarks: reducer_2.default
});
exports.default = pocketReducer;
exports.selectors = {
    auth: (state) => state.pocket.auth,
    bookmarks: (state) => state.pocket.bookmarks
};
//# sourceMappingURL=reducer.js.map