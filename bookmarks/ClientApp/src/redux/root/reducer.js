"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectors = void 0;
var redux_1 = require("redux");
var reducer_1 = require("../pocket/reducer");
var reducer_2 = require("../bookmarks/reducer");
var rootReducer = redux_1.combineReducers({ pocket: reducer_1.default, bookmarks: reducer_2.default });
exports.selectors = {
    selectState: function (state) { return state; },
    selectPocketState: function (state) { return state.pocket; },
    selectBookmarksState: function (state) { return state.bookmarks; },
};
exports.default = rootReducer;
//# sourceMappingURL=reducer.js.map