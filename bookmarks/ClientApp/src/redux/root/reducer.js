"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectors = void 0;
const redux_1 = require("redux");
const reducer_1 = require("../pocket/reducer");
const reducer_2 = require("../bookmarks/reducer");
const rootReducer = redux_1.combineReducers({ pocket: reducer_1.default, bookmarks: reducer_2.default });
exports.selectors = {
    selectState: (state) => state,
    selectPocketState: (state) => state.pocket,
    selectBookmarksState: (state) => state.bookmarks,
};
exports.default = rootReducer;
//# sourceMappingURL=reducer.js.map