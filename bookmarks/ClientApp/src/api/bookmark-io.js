"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noopBookmarkPersister = exports.TagModification = exports.toArray = void 0;
exports.toArray = (keys) => Array.isArray(keys) ? keys : [keys];
var TagModification;
(function (TagModification) {
    TagModification[TagModification["set"] = 0] = "set";
    TagModification[TagModification["add"] = 1] = "add";
    TagModification[TagModification["remove"] = 2] = "remove";
})(TagModification = exports.TagModification || (exports.TagModification = {}));
exports.noopBookmarkPersister = {};
//# sourceMappingURL=bookmark-io.js.map