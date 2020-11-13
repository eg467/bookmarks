export const toArray = (keys) => Array.isArray(keys) ? keys : [keys];
export var TagModification;
(function (TagModification) {
    TagModification[TagModification["set"] = 0] = "set";
    TagModification[TagModification["add"] = 1] = "add";
    TagModification[TagModification["remove"] = 2] = "remove";
})(TagModification || (TagModification = {}));
export const noopBookmarkPersister = {};
