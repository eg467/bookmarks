"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectors = void 0;
var redux_1 = require("redux");
var reducer_1 = require("./auth/reducer");
var reducer_2 = require("./bookmarks/reducer");
var pocketReducer = redux_1.combineReducers({
    auth: reducer_1.default, bookmarks: reducer_2.default
});
exports.default = pocketReducer;
exports.selectors = {
    auth: function (state) { return state.pocket.auth; },
    bookmarks: function (state) { return state.pocket.bookmarks; }
};
//# sourceMappingURL=reducer.js.map