import { ActionCreator, AnyAction } from "redux";
import { AddBookmarkInput, BookmarkKeys, TagModification } from "../../api/bookmark-io";
import { NullAction } from "../../redux/common/actions";
import { createFailurePromiseAction, createPromiseAction, PromiseClearingAction, PromiseDispatch, PromiseFailureAction, PromiseMiddlewareAction, PromiseSuccessAction, StartPromiseAction } from "../middleware/promise-middleware";
import { AppState, MyThunkResult } from "../root/reducer";
import { StoreDispatch } from "../store/configureStore";
import { BookmarkCollection, BookmarkData, BookmarkSortField } from "./bookmarks";
import { BookmarkSource, PartialSuccessResult, selectors } from "./reducer";

export enum ActionType {
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
    FILTER_CONTENT = "bookmarks/FILTER_CONTENT",
}

// ACTIONS

export interface ShowBookmarksAction {
    type: ActionType.SHOW;
    bookmarks: BookmarkCollection;
    source: BookmarkSource;
}

export type AddBookmarkActionPayload = {
    bookmarks: AddBookmarkInput[]
}
export type AddBookmarkAction = StartPromiseAction<ActionType.ADD, AddBookmarkActionPayload>;
export type AddBookmarkSuccessAction = PromiseSuccessAction<ActionType.ADD_SUCCESS, PartialSuccessResult, AddBookmarkActionPayload>;
export type AddBookmarkFailureAction = PromiseFailureAction<ActionType.ADD_FAILURE, AddBookmarkActionPayload>;
export type AddBookmarkClearAction = PromiseClearingAction<
    ActionType.ADD_CLEAR,
    ActionType.ADD_SUCCESS | ActionType.ADD_FAILURE,
    AddBookmarkActionPayload>;

export type KeyedBookmarkActionPayload = {
    keys: BookmarkKeys;
}
export type RemoveBookmarkAction = StartPromiseAction<ActionType.REMOVE, KeyedBookmarkActionPayload>;
export type RemoveBookmarkSuccessAction = PromiseSuccessAction<ActionType.REMOVE_SUCCESS, PartialSuccessResult, KeyedBookmarkActionPayload>;
export type RemoveBookmarkFailureAction = PromiseFailureAction<ActionType.REMOVE_FAILURE, KeyedBookmarkActionPayload>;
export type RemoveBookmarkClearAction = PromiseClearingAction<
    ActionType.REMOVE_CLEAR,
    ActionType.REMOVE_SUCCESS | ActionType.REMOVE_FAILURE,
    KeyedBookmarkActionPayload>;

export type BookmarkToggleActionPayload = {
    keys: BookmarkKeys;
    status: boolean;
}
export type ArchiveBookmarkAction = StartPromiseAction<ActionType.ARCHIVE, BookmarkToggleActionPayload>;
export type ArchiveBookmarkSuccessAction = PromiseSuccessAction<ActionType.ARCHIVE_SUCCESS, PartialSuccessResult, BookmarkToggleActionPayload>;
export type ArchiveBookmarkFailureAction = PromiseFailureAction<ActionType.ARCHIVE_FAILURE, BookmarkToggleActionPayload>;
export type ArchiveBookmarkClearAction = PromiseClearingAction<
    ActionType.ARCHIVE_CLEAR,
    ActionType.ARCHIVE_SUCCESS | ActionType.ARCHIVE_FAILURE,
    BookmarkToggleActionPayload>;

export type FavoriteBookmarkAction = StartPromiseAction<ActionType.FAVORITE, BookmarkToggleActionPayload>;
export type FavoriteBookmarkSuccessAction = PromiseSuccessAction<ActionType.FAVORITE_SUCCESS, PartialSuccessResult, BookmarkToggleActionPayload>;
export type FavoriteBookmarkFailureAction = PromiseFailureAction<ActionType.FAVORITE_FAILURE, BookmarkToggleActionPayload>;
export type FavoriteBookmarkClearAction = PromiseClearingAction<
    ActionType.FAVORITE_CLEAR,
    ActionType.FAVORITE_SUCCESS | ActionType.FAVORITE_FAILURE,
    BookmarkToggleActionPayload>;

export type ModifyTagsActionPayload = {
    keys: BookmarkKeys;
    operation: TagModification;
    tags: string;
}
export type ModifyTagsAction = StartPromiseAction<ActionType.MODIFY_TAGS, ModifyTagsActionPayload>;
export type ModifyTagsSuccessAction = PromiseSuccessAction<ActionType.MODIFY_TAGS_SUCCESS, PartialSuccessResult, ModifyTagsActionPayload>;
export type ModifyTagsFailureAction = PromiseFailureAction<ActionType.MODIFY_TAGS_FAILURE, ModifyTagsActionPayload>;
export type ModifyTagsClearAction = PromiseClearingAction<
    ActionType.MODIFY_TAGS_CLEAR,
    ActionType.MODIFY_TAGS_SUCCESS | ActionType.MODIFY_TAGS_FAILURE,
    ModifyTagsActionPayload>;

export type RenameTagActionPayload = {
    oldTag: string;
    newTag: string;
}
export type RenameTagAction = StartPromiseAction<ActionType.RENAME_TAG, RenameTagActionPayload>;
export type RenameTagSuccessAction = PromiseSuccessAction<ActionType.RENAME_TAG_SUCCESS, void, RenameTagActionPayload>;
export type RenameTagFailureAction = PromiseFailureAction<ActionType.RENAME_TAG_FAILURE, RenameTagActionPayload>;
export type RenameTagClearAction = PromiseClearingAction<
    ActionType.RENAME_TAG_CLEAR,
    ActionType.RENAME_TAG_SUCCESS | ActionType.RENAME_TAG_FAILURE,
    RenameTagActionPayload>;

export type DeleteTagActionPayload = {
    tag: string;
}
export type DeleteTagAction = StartPromiseAction<ActionType.DELETE_TAG, DeleteTagActionPayload>;
export type DeleteTagSuccessAction = PromiseSuccessAction<ActionType.DELETE_TAG_SUCCESS, void, DeleteTagActionPayload>;
export type DeleteTagFailureAction = PromiseFailureAction<ActionType.DELETE_TAG_FAILURE, DeleteTagActionPayload>;
export type DeleteTagClearAction = PromiseClearingAction<
    ActionType.DELETE_TAG_CLEAR,
    ActionType.DELETE_TAG_SUCCESS | ActionType.DELETE_TAG_FAILURE,
    DeleteTagActionPayload>;

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

export type BookmarkAction =
    ShowBookmarksAction
    | AddBookmarkAction | AddBookmarkSuccessAction | AddBookmarkFailureAction | AddBookmarkClearAction
    | RemoveBookmarkAction | RemoveBookmarkSuccessAction | RemoveBookmarkFailureAction | RemoveBookmarkClearAction
    | ArchiveBookmarkAction | ArchiveBookmarkSuccessAction | ArchiveBookmarkFailureAction | ArchiveBookmarkClearAction
    | FavoriteBookmarkAction | FavoriteBookmarkSuccessAction | FavoriteBookmarkFailureAction | FavoriteBookmarkClearAction
    | ModifyTagsAction | ModifyTagsSuccessAction | ModifyTagsFailureAction | ModifyTagsClearAction
    | RenameTagAction | RenameTagSuccessAction | RenameTagFailureAction | RenameTagClearAction
    | DeleteTagAction | DeleteTagSuccessAction | DeleteTagFailureAction | DeleteTagClearAction
    | SortBookmarksAction | SetAndTagsAction | SetOrTagsAction | SetNotTagsAction | SetContentFilterAction | NullAction;

// END ACTIONS

// ACTION CREATORS

const getPersister = (getState: () => AppState) => selectors.selectBookmarkPersister(getState());

export const actionCreators = {
    showBookmarks: (bookmarks: BookmarkCollection, source: BookmarkSource): ShowBookmarksAction => ({
        type: ActionType.SHOW,
        bookmarks,
        source
    }),

    sortBookmarks:
        (field: BookmarkSortField, ascendingOrder: boolean = true): SortBookmarksAction => ({
            type: ActionType.SORT,
            field,
            ascendingOrder
        }),

    setAndFilter: (tags: string[]): SetAndTagsAction => ({ type: ActionType.FILTER_AND_TAGS, tags }),
    setOrFilter: (tags: string[]): SetOrTagsAction => ({ type: ActionType.FILTER_OR_TAGS, tags }),
    setNotFilter: (tags: string[]): SetNotTagsAction => ({ type: ActionType.FILTER_NOT_TAGS, tags }),

    get add() {
        return (bookmarks: AddBookmarkInput[]): MyThunkResult<Promise<void>> => {
            return async (dispatch: StoreDispatch, getState) => {
                const persister = getPersister(getState);

                await dispatch(createPromiseAction({
                    startType: ActionType.ADD,
                    successType: ActionType.ADD_SUCCESS,
                    failureType: ActionType.ADD_FAILURE,
                    promise: () => (persister && persister.add)
                        ? persister.add(bookmarks)
                        : Promise.reject(Error("Unsupported bookmark operation.")),
                    payload: <AddBookmarkActionPayload>{ bookmarks }
                })).catch(e => {
                    // TODO: Add user error notifications in UI & Redux state.
                    console.error(e);
                });

                // Refresh the page after adding new bookmarks.
                // (Sometimes API responses to adding new bookmarks)
                if (persister.refresh) {
                    const newBookmarks = await persister.refresh();
                    var source = selectors.selectBookmarkSource(getState())
                    dispatch(this.showBookmarks(newBookmarks, source));
                }
            };
        };
    },

    remove: (keys: BookmarkKeys): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState) => {
            const persister = getPersister(getState);

            await dispatch(createPromiseAction({
                startType: ActionType.REMOVE,
                successType: ActionType.REMOVE_SUCCESS,
                failureType: ActionType.REMOVE_FAILURE,
                promise: () => persister.remove
                    ? persister.remove(keys)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: <KeyedBookmarkActionPayload>{ keys }
            }));
        };
    },

    archive: (keys: BookmarkKeys, status: boolean): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState) => {
            const persister = getPersister(getState);
            await dispatch(createPromiseAction({
                startType: ActionType.ARCHIVE,
                successType: ActionType.ARCHIVE_SUCCESS,
                failureType: ActionType.ARCHIVE_FAILURE,
                promise: () => persister.archive
                    ? persister.archive(keys, status)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: <BookmarkToggleActionPayload>{ keys }
            }));
        };
    },

    favorite: (input: BookmarkToggleActionPayload): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState) => {
            const persister = getPersister(getState);
            const { keys, status } = input;
            await dispatch(createPromiseAction({
                startType: ActionType.FAVORITE,
                successType: ActionType.FAVORITE_SUCCESS,
                failureType: ActionType.FAVORITE_FAILURE,
                promise: () => persister.favorite
                    ? persister.favorite(keys, status)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: input
            }));
        };
    },

    modifyTags: (input: ModifyTagsActionPayload): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState) => {
            const persister = getPersister(getState);
            const { keys, tags, operation } = input;
            await dispatch(createPromiseAction({
                startType: ActionType.MODIFY_TAGS,
                successType: ActionType.MODIFY_TAGS_SUCCESS,
                failureType: ActionType.MODIFY_TAGS_FAILURE,
                promise: () => persister.modifyTags
                    ? persister.modifyTags(keys, tags, operation)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: input
            }));
        };
    },

    renameTag: (input: RenameTagActionPayload): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState) => {
            const persister = getPersister(getState);
            const { newTag, oldTag } = input;
            await dispatch(createPromiseAction({
                startType: ActionType.RENAME_TAG,
                successType: ActionType.RENAME_TAG_SUCCESS,
                failureType: ActionType.RENAME_TAG_FAILURE,
                promise: () => persister.renameTag
                    ? persister.renameTag(oldTag, newTag)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: input
            }));
        };
    },

    deleteTag: (input: DeleteTagActionPayload): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState) => {
            const persister = getPersister(getState);
            const { tag } = input;
            await dispatch(createPromiseAction({
                startType: ActionType.DELETE_TAG,
                successType: ActionType.DELETE_TAG_SUCCESS,
                failureType: ActionType.DELETE_TAG_FAILURE,
                promise: () => persister.deleteTag
                    ? persister.deleteTag(tag)
                    : Promise.reject(Error("Unsupported bookmark operation.")),
                payload: input
            }));
        };
    }
};

// END ACTION CREATORS