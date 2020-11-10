import { AddBookmarkInput, BookmarkKeys, TagModification } from "../../api/bookmark-io";
import { NullAction } from "../../redux/common/actions";
import { PromiseClearingAction, PromiseFailureAction, PromiseSuccessAction, StartPromiseAction } from "../middleware/promise-middleware";
import { MyThunkResult } from "../root/reducer";
import { BookmarkCollection, BookmarkSortField } from "./bookmarks";
import { BookmarkSource, PartialSuccessResult } from "./reducer";
export declare enum ActionType {
    SHOW = "bookmarks/SHOW",
    ADD = "bookmarks/ADD",
    ADD_SUCCESS = "bookmarks/ADD_SUCCESS",
    ADD_FAILURE = "bookmarks/ADD_FAILURE",
    ADD_CLEAR = "bookmarks/ADD_CLEAR",
    REMOVE = "bookmarks/REMOVE",
    REMOVE_SUCCESS = "bookmarks/REMOVE_SUCCESS",
    REMOVE_FAILURE = "bookmarks/REMOVE_FAILURE",
    REMOVE_CLEAR = "bookmarks/REMOVE_CLEAR",
    ARCHIVE = "bookmarks/ARCHIVE",
    ARCHIVE_SUCCESS = "bookmarks/ARCHIVE_SUCCESS",
    ARCHIVE_FAILURE = "bookmarks/ARCHIVE_FAILURE",
    ARCHIVE_CLEAR = "bookmarks/ARCHIVE_CLEAR",
    FAVORITE = "bookmarks/FAVORITE",
    FAVORITE_SUCCESS = "bookmarks/FAVORITE_SUCCESS",
    FAVORITE_FAILURE = "bookmarks/FAVORITE_FAILURE",
    FAVORITE_CLEAR = "bookmarks/FAVORITE_CLEAR",
    MODIFY_TAGS = "bookmarks/MODIFY_TAGS",
    MODIFY_TAGS_SUCCESS = "bookmarks/MODIFY_TAGS_SUCCESS",
    MODIFY_TAGS_FAILURE = "bookmarks/MODIFY_TAGS_FAILURE",
    MODIFY_TAGS_CLEAR = "bookmarks/MODIFY_TAGS_CLEAR",
    RENAME_TAG = "bookmarks/RENAME_TAG",
    RENAME_TAG_SUCCESS = "bookmarks/RENAME_TAG_SUCCESS",
    RENAME_TAG_FAILURE = "bookmarks/RENAME_TAG_FAILURE",
    RENAME_TAG_CLEAR = "bookmarks/RENAME_TAG_CLEAR",
    DELETE_TAG = "bookmarks/DELETE_TAG",
    DELETE_TAG_SUCCESS = "bookmarks/DELETE_TAG_SUCCESS",
    DELETE_TAG_FAILURE = "bookmarks/DELETE_TAG_FAILURE",
    DELETE_TAG_CLEAR = "bookmarks/DELETE_TAG_CLEAR",
    SORT = "bookmarks/SORT",
    FILTER_AND_TAGS = "bookmarks/FILTER_AND_TAGS",
    FILTER_OR_TAGS = "bookmarks/FILTER_OR_TAGS",
    FILTER_NOT_TAGS = "bookmarks/FILTER_NOT_TAGS",
    FILTER_CONTENT = "bookmarks/FILTER_CONTENT"
}
export interface ShowBookmarksAction {
    type: ActionType.SHOW;
    bookmarks: BookmarkCollection;
    source: BookmarkSource;
}
export declare type AddBookmarkActionPayload = {
    bookmarks: AddBookmarkInput[];
};
export declare type AddBookmarkAction = StartPromiseAction<ActionType.ADD, AddBookmarkActionPayload>;
export declare type AddBookmarkSuccessAction = PromiseSuccessAction<ActionType.ADD_SUCCESS, PartialSuccessResult, AddBookmarkActionPayload>;
export declare type AddBookmarkFailureAction = PromiseFailureAction<ActionType.ADD_FAILURE, AddBookmarkActionPayload>;
export declare type AddBookmarkClearAction = PromiseClearingAction<ActionType.ADD_CLEAR, ActionType.ADD_SUCCESS | ActionType.ADD_FAILURE, AddBookmarkActionPayload>;
export declare type KeyedBookmarkActionPayload = {
    keys: BookmarkKeys;
};
export declare type RemoveBookmarkAction = StartPromiseAction<ActionType.REMOVE, KeyedBookmarkActionPayload>;
export declare type RemoveBookmarkSuccessAction = PromiseSuccessAction<ActionType.REMOVE_SUCCESS, PartialSuccessResult, KeyedBookmarkActionPayload>;
export declare type RemoveBookmarkFailureAction = PromiseFailureAction<ActionType.REMOVE_FAILURE, KeyedBookmarkActionPayload>;
export declare type RemoveBookmarkClearAction = PromiseClearingAction<ActionType.REMOVE_CLEAR, ActionType.REMOVE_SUCCESS | ActionType.REMOVE_FAILURE, KeyedBookmarkActionPayload>;
export declare type BookmarkToggleActionPayload = {
    keys: BookmarkKeys;
    status: boolean;
};
export declare type ArchiveBookmarkAction = StartPromiseAction<ActionType.ARCHIVE, BookmarkToggleActionPayload>;
export declare type ArchiveBookmarkSuccessAction = PromiseSuccessAction<ActionType.ARCHIVE_SUCCESS, PartialSuccessResult, BookmarkToggleActionPayload>;
export declare type ArchiveBookmarkFailureAction = PromiseFailureAction<ActionType.ARCHIVE_FAILURE, BookmarkToggleActionPayload>;
export declare type ArchiveBookmarkClearAction = PromiseClearingAction<ActionType.ARCHIVE_CLEAR, ActionType.ARCHIVE_SUCCESS | ActionType.ARCHIVE_FAILURE, BookmarkToggleActionPayload>;
export declare type FavoriteBookmarkAction = StartPromiseAction<ActionType.FAVORITE, BookmarkToggleActionPayload>;
export declare type FavoriteBookmarkSuccessAction = PromiseSuccessAction<ActionType.FAVORITE_SUCCESS, PartialSuccessResult, BookmarkToggleActionPayload>;
export declare type FavoriteBookmarkFailureAction = PromiseFailureAction<ActionType.FAVORITE_FAILURE, BookmarkToggleActionPayload>;
export declare type FavoriteBookmarkClearAction = PromiseClearingAction<ActionType.FAVORITE_CLEAR, ActionType.FAVORITE_SUCCESS | ActionType.FAVORITE_FAILURE, BookmarkToggleActionPayload>;
export declare type ModifyTagsActionPayload = {
    keys: BookmarkKeys;
    operation: TagModification;
    tags: string;
};
export declare type ModifyTagsAction = StartPromiseAction<ActionType.MODIFY_TAGS, ModifyTagsActionPayload>;
export declare type ModifyTagsSuccessAction = PromiseSuccessAction<ActionType.MODIFY_TAGS_SUCCESS, PartialSuccessResult, ModifyTagsActionPayload>;
export declare type ModifyTagsFailureAction = PromiseFailureAction<ActionType.MODIFY_TAGS_FAILURE, ModifyTagsActionPayload>;
export declare type ModifyTagsClearAction = PromiseClearingAction<ActionType.MODIFY_TAGS_CLEAR, ActionType.MODIFY_TAGS_SUCCESS | ActionType.MODIFY_TAGS_FAILURE, ModifyTagsActionPayload>;
export declare type RenameTagActionPayload = {
    oldTag: string;
    newTag: string;
};
export declare type RenameTagAction = StartPromiseAction<ActionType.RENAME_TAG, RenameTagActionPayload>;
export declare type RenameTagSuccessAction = PromiseSuccessAction<ActionType.RENAME_TAG_SUCCESS, void, RenameTagActionPayload>;
export declare type RenameTagFailureAction = PromiseFailureAction<ActionType.RENAME_TAG_FAILURE, RenameTagActionPayload>;
export declare type RenameTagClearAction = PromiseClearingAction<ActionType.RENAME_TAG_CLEAR, ActionType.RENAME_TAG_SUCCESS | ActionType.RENAME_TAG_FAILURE, RenameTagActionPayload>;
export declare type DeleteTagActionPayload = {
    tag: string;
};
export declare type DeleteTagAction = StartPromiseAction<ActionType.DELETE_TAG, DeleteTagActionPayload>;
export declare type DeleteTagSuccessAction = PromiseSuccessAction<ActionType.DELETE_TAG_SUCCESS, void, DeleteTagActionPayload>;
export declare type DeleteTagFailureAction = PromiseFailureAction<ActionType.DELETE_TAG_FAILURE, DeleteTagActionPayload>;
export declare type DeleteTagClearAction = PromiseClearingAction<ActionType.DELETE_TAG_CLEAR, ActionType.DELETE_TAG_SUCCESS | ActionType.DELETE_TAG_FAILURE, DeleteTagActionPayload>;
export interface SortBookmarksAction {
    type: ActionType.SORT;
    field: BookmarkSortField;
    ascendingOrder: boolean;
}
export interface SetContentFilterAction {
    type: ActionType.FILTER_CONTENT;
    q: string;
}
export interface SetAndTagsAction {
    type: ActionType.FILTER_AND_TAGS;
    tags: string[];
}
export interface SetOrTagsAction {
    type: ActionType.FILTER_OR_TAGS;
    tags: string[];
}
export interface SetNotTagsAction {
    type: ActionType.FILTER_NOT_TAGS;
    tags: string[];
}
export declare type BookmarkAction = ShowBookmarksAction | AddBookmarkAction | AddBookmarkSuccessAction | AddBookmarkFailureAction | AddBookmarkClearAction | RemoveBookmarkAction | RemoveBookmarkSuccessAction | RemoveBookmarkFailureAction | RemoveBookmarkClearAction | ArchiveBookmarkAction | ArchiveBookmarkSuccessAction | ArchiveBookmarkFailureAction | ArchiveBookmarkClearAction | FavoriteBookmarkAction | FavoriteBookmarkSuccessAction | FavoriteBookmarkFailureAction | FavoriteBookmarkClearAction | ModifyTagsAction | ModifyTagsSuccessAction | ModifyTagsFailureAction | ModifyTagsClearAction | RenameTagAction | RenameTagSuccessAction | RenameTagFailureAction | RenameTagClearAction | DeleteTagAction | DeleteTagSuccessAction | DeleteTagFailureAction | DeleteTagClearAction | SortBookmarksAction | SetAndTagsAction | SetOrTagsAction | SetNotTagsAction | SetContentFilterAction | NullAction;
export declare const actionCreators: {
    showBookmarks: (bookmarks: BookmarkCollection, source: BookmarkSource) => ShowBookmarksAction;
    sortBookmarks: (field: BookmarkSortField, ascendingOrder?: boolean) => SortBookmarksAction;
    setAndFilter: (tags: string[]) => SetAndTagsAction;
    setOrFilter: (tags: string[]) => SetOrTagsAction;
    setNotFilter: (tags: string[]) => SetNotTagsAction;
    readonly add: (bookmarks: AddBookmarkInput[]) => MyThunkResult<Promise<void>>;
    remove: (keys: BookmarkKeys) => MyThunkResult<Promise<void>>;
    archive: (keys: BookmarkKeys, status: boolean) => MyThunkResult<Promise<void>>;
    favorite: (input: BookmarkToggleActionPayload) => MyThunkResult<Promise<void>>;
    modifyTags: (input: ModifyTagsActionPayload) => MyThunkResult<Promise<void>>;
    renameTag: (input: RenameTagActionPayload) => MyThunkResult<Promise<void>>;
    deleteTag: (input: DeleteTagActionPayload) => MyThunkResult<Promise<void>>;
};
