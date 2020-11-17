import {
    AddBookmarkInput,
    BookmarkKeys,
    BookmarkPersister,
    TagModification,
} from "../../api/bookmark-io";
import { NullAction } from "../common/actions";
import {
    createPromiseAction,
    PromiseClearingAction,
    PromiseFailureAction,
    PromiseSuccessAction,
    StartPromiseAction,
} from "../middleware/promise-middleware";
import { AppState, MyThunkResult } from "../root/reducer";
import { StoreDispatch } from "../store/configureStore";
import { BookmarkCollection, BookmarkSortField } from "./bookmarks";
import { BookmarkSource, PartialSuccessResult, selectors } from "./reducer";
import { BookmarkImporter } from "../../api/BookmarkImporter";

export enum ActionType {
    LOAD = "bookmarks/LOAD",

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
    FILTER_ARCHIVE = "bookmarks/FILTER_ARCHIVE",
    FILTER_FAVORITE = "bookmarks/FILTER_FAVORITE",
}

// ACTIONS

export interface LoadBookmarksAction {
    type: ActionType.LOAD;
    bookmarks: BookmarkCollection;
    source: BookmarkSource;
}

export type AddBookmarkActionPayload = {
    bookmarks: AddBookmarkInput[];
};
export type AddBookmarkAction = StartPromiseAction<
    ActionType.ADD,
    AddBookmarkActionPayload
    >;
export type AddBookmarkSuccessAction = PromiseSuccessAction<
    ActionType.ADD_SUCCESS,
    PartialSuccessResult,
    AddBookmarkActionPayload
    >;
export type AddBookmarkFailureAction = PromiseFailureAction<
    ActionType.ADD_FAILURE,
    AddBookmarkActionPayload
    >;
export type AddBookmarkClearAction = PromiseClearingAction<
    ActionType.ADD_CLEAR,
    ActionType.ADD_SUCCESS | ActionType.ADD_FAILURE,
    AddBookmarkActionPayload
    >;

export type KeyedBookmarkActionPayload = {
    keys: BookmarkKeys;
};
export type RemoveBookmarkAction = StartPromiseAction<
    ActionType.REMOVE,
    KeyedBookmarkActionPayload
    >;
export type RemoveBookmarkSuccessAction = PromiseSuccessAction<
    ActionType.REMOVE_SUCCESS,
    PartialSuccessResult,
    KeyedBookmarkActionPayload
    >;
export type RemoveBookmarkFailureAction = PromiseFailureAction<
    ActionType.REMOVE_FAILURE,
    KeyedBookmarkActionPayload
    >;
export type RemoveBookmarkClearAction = PromiseClearingAction<
    ActionType.REMOVE_CLEAR,
    ActionType.REMOVE_SUCCESS | ActionType.REMOVE_FAILURE,
    KeyedBookmarkActionPayload
    >;

export type BookmarkToggleActionPayload = {
    keys: BookmarkKeys;
    status: boolean;
};
export type ArchiveBookmarkAction = StartPromiseAction<
    ActionType.ARCHIVE,
    BookmarkToggleActionPayload
    >;
export type ArchiveBookmarkSuccessAction = PromiseSuccessAction<
    ActionType.ARCHIVE_SUCCESS,
    PartialSuccessResult,
    BookmarkToggleActionPayload
    >;
export type ArchiveBookmarkFailureAction = PromiseFailureAction<
    ActionType.ARCHIVE_FAILURE,
    BookmarkToggleActionPayload
    >;
export type ArchiveBookmarkClearAction = PromiseClearingAction<
    ActionType.ARCHIVE_CLEAR,
    ActionType.ARCHIVE_SUCCESS | ActionType.ARCHIVE_FAILURE,
    BookmarkToggleActionPayload
    >;

export type FavoriteBookmarkAction = StartPromiseAction<
    ActionType.FAVORITE,
    BookmarkToggleActionPayload
    >;
export type FavoriteBookmarkSuccessAction = PromiseSuccessAction<
    ActionType.FAVORITE_SUCCESS,
    PartialSuccessResult,
    BookmarkToggleActionPayload
    >;
export type FavoriteBookmarkFailureAction = PromiseFailureAction<
    ActionType.FAVORITE_FAILURE,
    BookmarkToggleActionPayload
    >;
export type FavoriteBookmarkClearAction = PromiseClearingAction<
    ActionType.FAVORITE_CLEAR,
    ActionType.FAVORITE_SUCCESS | ActionType.FAVORITE_FAILURE,
    BookmarkToggleActionPayload
    >;

export type ModifyTagsActionPayload = {
    keys: BookmarkKeys;
    operation: TagModification;
    tags: string;
};
export type ModifyTagsAction = StartPromiseAction<
    ActionType.MODIFY_TAGS,
    ModifyTagsActionPayload
    >;
export type ModifyTagsSuccessAction = PromiseSuccessAction<
    ActionType.MODIFY_TAGS_SUCCESS,
    PartialSuccessResult,
    ModifyTagsActionPayload
    >;
export type ModifyTagsFailureAction = PromiseFailureAction<
    ActionType.MODIFY_TAGS_FAILURE,
    ModifyTagsActionPayload
    >;
export type ModifyTagsClearAction = PromiseClearingAction<
    ActionType.MODIFY_TAGS_CLEAR,
    ActionType.MODIFY_TAGS_SUCCESS | ActionType.MODIFY_TAGS_FAILURE,
    ModifyTagsActionPayload
    >;

export type RenameTagActionPayload = {
    oldTag: string;
    newTag: string;
};
export type RenameTagAction = StartPromiseAction<
    ActionType.RENAME_TAG,
    RenameTagActionPayload
    >;
export type RenameTagSuccessAction = PromiseSuccessAction<
    ActionType.RENAME_TAG_SUCCESS,
    void,
    RenameTagActionPayload
    >;
export type RenameTagFailureAction = PromiseFailureAction<
    ActionType.RENAME_TAG_FAILURE,
    RenameTagActionPayload
    >;
export type RenameTagClearAction = PromiseClearingAction<
    ActionType.RENAME_TAG_CLEAR,
    ActionType.RENAME_TAG_SUCCESS | ActionType.RENAME_TAG_FAILURE,
    RenameTagActionPayload
    >;

export type DeleteTagActionPayload = {
    tag: string;
};
export type DeleteTagAction = StartPromiseAction<
    ActionType.DELETE_TAG,
    DeleteTagActionPayload
    >;
export type DeleteTagSuccessAction = PromiseSuccessAction<
    ActionType.DELETE_TAG_SUCCESS,
    void,
    DeleteTagActionPayload
    >;
export type DeleteTagFailureAction = PromiseFailureAction<
    ActionType.DELETE_TAG_FAILURE,
    DeleteTagActionPayload
    >;
export type DeleteTagClearAction = PromiseClearingAction<
    ActionType.DELETE_TAG_CLEAR,
    ActionType.DELETE_TAG_SUCCESS | ActionType.DELETE_TAG_FAILURE,
    DeleteTagActionPayload
    >;

export interface SortBookmarksAction {
    type: ActionType.SORT;
    field: BookmarkSortField;
    ascendingOrder: boolean;
}

export interface SetContentFilterAction {
    type: ActionType.FILTER_CONTENT;
    q: string;
}

export interface SetFilterAndTagsAction {
    type: ActionType.FILTER_AND_TAGS;
    tags: string[];
}

export interface SetFilterOrTagsAction {
    type: ActionType.FILTER_OR_TAGS;
    tags: string[];
}

export interface SetFilterNotTagsAction {
    type: ActionType.FILTER_NOT_TAGS;
    tags: string[];
}

export interface SetFilterArchiveAction {
    type: ActionType.FILTER_ARCHIVE;
    archived?: boolean;
}

export interface SetFilterFavoriteAction {
    type: ActionType.FILTER_FAVORITE;
    favorite?: boolean;
}


export type BookmarkAction =
    | LoadBookmarksAction
    | AddBookmarkAction
    | AddBookmarkSuccessAction
    | AddBookmarkFailureAction
    | AddBookmarkClearAction
    | RemoveBookmarkAction
    | RemoveBookmarkSuccessAction
    | RemoveBookmarkFailureAction
    | RemoveBookmarkClearAction
    | ArchiveBookmarkAction
    | ArchiveBookmarkSuccessAction
    | ArchiveBookmarkFailureAction
    | ArchiveBookmarkClearAction
    | FavoriteBookmarkAction
    | FavoriteBookmarkSuccessAction
    | FavoriteBookmarkFailureAction
    | FavoriteBookmarkClearAction
    | ModifyTagsAction
    | ModifyTagsSuccessAction
    | ModifyTagsFailureAction
    | ModifyTagsClearAction
    | RenameTagAction
    | RenameTagSuccessAction
    | RenameTagFailureAction
    | RenameTagClearAction
    | DeleteTagAction
    | DeleteTagSuccessAction
    | DeleteTagFailureAction
    | DeleteTagClearAction
    | SortBookmarksAction
    | SetFilterAndTagsAction
    | SetFilterOrTagsAction
    | SetFilterNotTagsAction
    | SetContentFilterAction
    | SetFilterArchiveAction
    | SetFilterFavoriteAction
    | NullAction;

// END ACTIONS

// ACTION CREATORS

const getPersister = (getState: () => AppState): BookmarkPersister =>
    selectors.selectBookmarkPersister(getState());

export const actionCreators = {
    loadBookmarks: (
        bookmarks: BookmarkCollection,
        source: BookmarkSource,
    ): LoadBookmarksAction => ({
        type: ActionType.LOAD,
        bookmarks,
        source,
    }),

    loadSerializedBookmarks: (
        serializedBookmarks: string,
        source: BookmarkSource,
    ): LoadBookmarksAction => {
        const importer = new BookmarkImporter();
        importer.addJson(serializedBookmarks);

        return {
            type: ActionType.LOAD,
            bookmarks: importer.collection,
            source,
        };
    },

    sortBookmarks: (
        field: BookmarkSortField,
        ascendingOrder = true,
    ): SortBookmarksAction => ({
        type: ActionType.SORT,
        field,
        ascendingOrder,
    }),

    setAndFilter: (tags: string[]): SetFilterAndTagsAction => ({
        type: ActionType.FILTER_AND_TAGS,
        tags,
    }),
    setOrFilter: (tags: string[]): SetFilterOrTagsAction => ({
        type: ActionType.FILTER_OR_TAGS,
        tags,
    }),
    setNotFilter: (tags: string[]): SetFilterNotTagsAction => ({
        type: ActionType.FILTER_NOT_TAGS,
        tags,
    }),
    setContentFilter: (q: string): SetContentFilterAction => ({
        type: ActionType.FILTER_CONTENT,
        q
    }),
    setArchiveFilter: (archived: boolean|undefined): SetFilterArchiveAction => ({
        type: ActionType.FILTER_ARCHIVE,
        archived
    }),
    setFavoriteFilter: (favorite: boolean|undefined): SetFilterFavoriteAction => ({
        type: ActionType.FILTER_FAVORITE,
        favorite
    }),
    get add() {
        return (bookmarks: AddBookmarkInput[]): MyThunkResult<Promise<void>> => {
            return async (dispatch: StoreDispatch, getState): Promise<void> => {
                const persister = getPersister(getState);

                await dispatch(
                    createPromiseAction({
                        startType: ActionType.ADD,
                        successType: ActionType.ADD_SUCCESS,
                        failureType: ActionType.ADD_FAILURE,
                        promise: () =>
                            persister && persister.add
                                ? persister.add(bookmarks)
                                : Promise.reject(
                                Error("Unsupported bookmark operation."),
                                ),
                        payload: { bookmarks } as AddBookmarkActionPayload,
                    }),
                ).catch((e) => {
                    // TODO: Add user error notifications in UI & Redux state.
                    console.error(e);
                });

                // Refresh the page after adding new bookmarks.
                // (Sometimes API responses to adding new bookmarks)
                if (persister.refresh) {
                    const newBookmarks = await persister.refresh();
                    const source = selectors.selectBookmarkSource(getState());
                    dispatch(this.loadBookmarks(newBookmarks, source));
                }
            };
        };
    },

    remove: (keys: BookmarkKeys): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState): Promise<void> => {
            const persister = getPersister(getState);

            await dispatch(
                createPromiseAction({
                    startType: ActionType.REMOVE,
                    successType: ActionType.REMOVE_SUCCESS,
                    failureType: ActionType.REMOVE_FAILURE,
                    promise: () =>
                        persister.remove
                            ? persister.remove(keys)
                            : Promise.reject(Error("Unsupported bookmark operation.")),
                    payload: { keys } as KeyedBookmarkActionPayload,
                }),
            );
        };
    },

    archive: (
        keys: BookmarkKeys,
        status: boolean,
    ): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState): Promise<void> => {
            const persister = getPersister(getState);
            await dispatch(
                createPromiseAction({
                    startType: ActionType.ARCHIVE,
                    successType: ActionType.ARCHIVE_SUCCESS,
                    failureType: ActionType.ARCHIVE_FAILURE,
                    promise: () =>
                        persister.archive
                            ? persister.archive(keys, status)
                            : Promise.reject(Error("Unsupported bookmark operation.")),
                    payload: { keys } as BookmarkToggleActionPayload,
                }),
            );
        };
    },

    favorite: (
        input: BookmarkToggleActionPayload,
    ): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState): Promise<void> => {
            const persister = getPersister(getState);
            const { keys, status } = input;
            await dispatch(
                createPromiseAction({
                    startType: ActionType.FAVORITE,
                    successType: ActionType.FAVORITE_SUCCESS,
                    failureType: ActionType.FAVORITE_FAILURE,
                    promise: () =>
                        persister.favorite
                            ? persister.favorite(keys, status)
                            : Promise.reject(Error("Unsupported bookmark operation.")),
                    payload: input,
                }),
            );
        };
    },

    modifyTags: (
        input: ModifyTagsActionPayload,
    ): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState): Promise<void> => {
            const persister = getPersister(getState);
            const { keys, tags, operation } = input;
            await dispatch(
                createPromiseAction({
                    startType: ActionType.MODIFY_TAGS,
                    successType: ActionType.MODIFY_TAGS_SUCCESS,
                    failureType: ActionType.MODIFY_TAGS_FAILURE,
                    promise: () =>
                        persister.modifyTags
                            ? persister.modifyTags(keys, tags, operation)
                            : Promise.reject(Error("Unsupported bookmark operation.")),
                    payload: input,
                }),
            );
        };
    },

    renameTag: (input: RenameTagActionPayload): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState): Promise<void> => {
            const persister = getPersister(getState);
            const { newTag, oldTag } = input;
            await dispatch(
                createPromiseAction({
                    startType: ActionType.RENAME_TAG,
                    successType: ActionType.RENAME_TAG_SUCCESS,
                    failureType: ActionType.RENAME_TAG_FAILURE,
                    promise: () =>
                        persister.renameTag
                            ? persister.renameTag(oldTag, newTag)
                            : Promise.reject(Error("Unsupported bookmark operation.")),
                    payload: input,
                }),
            );
        };
    },

    deleteTag: (input: DeleteTagActionPayload): MyThunkResult<Promise<void>> => {
        return async (dispatch: StoreDispatch, getState): Promise<void> => {
            const persister = getPersister(getState);
            const { tag } = input;
            await dispatch(
                createPromiseAction({
                    startType: ActionType.DELETE_TAG,
                    successType: ActionType.DELETE_TAG_SUCCESS,
                    failureType: ActionType.DELETE_TAG_FAILURE,
                    promise: () =>
                        persister.deleteTag
                            ? persister.deleteTag(tag)
                            : Promise.reject(Error("Unsupported bookmark operation.")),
                    payload: input,
                }),
            );
        };
    },
};

// END ACTION CREATORS
