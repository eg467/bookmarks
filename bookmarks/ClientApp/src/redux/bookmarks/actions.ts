import {
   AddBookmarkResults,
   BookmarkKeys,
   BookmarkPersister,
   BookmarkSeed,
   TagModification,
} from "../../api/bookmark-io";
import {
   createPromiseAction,
   PromiseClearingAction,
   PromiseFailureAction,
   PromiseSuccessAction,
   StartPromiseAction,
} from "../middleware/promise-middleware";
import {AppState, MyThunkResult} from "../root/reducer";
import {StoreDispatch} from "../store/configureStore";
import {BookmarkCollection, BookmarkSortField, toBookmarkArray} from "./bookmarks";
import {
   BookmarkSourceType,
   createBookmarkSource,
   createPartialSuccessResult,
   PartialSuccessResult,
   PersistenceResult,
   selectBookmarks,
   selectors,
   SourcedBookmarks
} from "./reducer";
import {BookmarkImporter} from "../../api/BookmarkImporter";
import pocketApi from "../../api/pocket-api";
import {exportToBrowserBookmarksHtml} from "../../api/BrowserBookmarkConverter";
import {downloadFile, yyyymmdd} from "../../utils";
import {createLocalBookmarkPersister} from "../../api/LocalStoragePersister";

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
    FILTER_SELECTED = "bookmarks/FILTER_SELECTED",
    CLEAR_FILTERS = "bookmarks/CLEAR_FILTERS",
    SELECT = "bookmarks/SELECT",

    EXPORT = "bookmarks/EXPORT",
    EXPORT_SUCCESS = "bookmarks/EXPORT_SUCCESS",
    EXPORT_FAILURE = "bookmarks/EXPORT_FAILURE",
    EXPORT_CLEAR = "bookmarks/EXPORT_CLEAR",
}

// ACTIONS

export interface LoadBookmarksAction {
    type: ActionType.LOAD;
    sourcedBookmarks: SourcedBookmarks;
}

export type AddBookmarkActionPayload = {
    bookmarks: OneOrMany<BookmarkSeed>;
};
export type AddBookmarkAction = StartPromiseAction<
    ActionType.ADD,
    AddBookmarkActionPayload
    >;
export type AddBookmarkSuccessAction = PromiseSuccessAction<
    ActionType.ADD_SUCCESS,
    AddBookmarkResults,
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
export type RenameTagActionResult = PersistenceResult;
export type RenameTagAction = StartPromiseAction<
    ActionType.RENAME_TAG,
    RenameTagActionPayload
    >;
export type RenameTagSuccessAction = PromiseSuccessAction<
    ActionType.RENAME_TAG_SUCCESS,
    RenameTagActionResult,
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
export type DeleteTagActionResult = PersistenceResult;
export type DeleteTagAction = StartPromiseAction<
    ActionType.DELETE_TAG,
    DeleteTagActionPayload
    >;
export type DeleteTagSuccessAction = PromiseSuccessAction<
    ActionType.DELETE_TAG_SUCCESS,
    DeleteTagActionResult,
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

export type SortBookmarksAction = {
    type: ActionType.SORT;
    field: BookmarkSortField;
    ascendingOrder: boolean;
}

export type SetContentFilterAction = {
    type: ActionType.FILTER_CONTENT;
    q: string;
};

export type SetFilterAndTagsAction = {
    type: ActionType.FILTER_AND_TAGS;
    tags: string[];
};

export type SetFilterOrTagsAction = {
    type: ActionType.FILTER_OR_TAGS;
    tags: string[];
};

export type SetFilterNotTagsAction = {
    type: ActionType.FILTER_NOT_TAGS;
    tags: string[];
};

export type SetFilterArchiveAction = {
    type: ActionType.FILTER_ARCHIVE;
    archived?: boolean;
};

export type SetFilterFavoriteAction = {
    type: ActionType.FILTER_FAVORITE;
    favorite?: boolean;
};

export type SetFilterSelectedAction = {
    type: ActionType.FILTER_SELECTED;
    selected?: boolean;
};

export type ClearFiltersAction = {
    type: ActionType.CLEAR_FILTERS;
};

export type SelectAction = {
    type: ActionType.SELECT;
    bookmarkIds?: BookmarkKeys,
    selected: boolean
};


export type ExportActionResult = AddBookmarkResults;
export type ExportActionJsonResult = ExportActionResult & {json: string};
export type ExportActionPayload = {
   sourcedBookmarks: SourcedBookmarks;
   transferOnCompletion: boolean;
};
export type ExportAction = StartPromiseAction<
   ActionType.EXPORT,
   ExportActionPayload
   >;
export type ExportSuccessAction = PromiseSuccessAction<
   ActionType.EXPORT_SUCCESS,
   ExportActionResult,
   ExportActionPayload
   >;
export type ExportFailureAction = PromiseFailureAction<
   ActionType.EXPORT_FAILURE,
   ExportActionPayload
   >;
export type ExportClearAction = PromiseClearingAction<
   ActionType.EXPORT_CLEAR,
   ActionType.EXPORT_SUCCESS | ActionType.EXPORT_FAILURE,
   ExportActionPayload
   >;

export type BookmarkAction =
   | LoadBookmarksAction 
   | AddBookmarkAction | AddBookmarkSuccessAction | AddBookmarkFailureAction | AddBookmarkClearAction
   | RemoveBookmarkAction | RemoveBookmarkSuccessAction | RemoveBookmarkFailureAction | RemoveBookmarkClearAction
   | ArchiveBookmarkAction | ArchiveBookmarkSuccessAction | ArchiveBookmarkFailureAction | ArchiveBookmarkClearAction
   | FavoriteBookmarkAction | FavoriteBookmarkSuccessAction | FavoriteBookmarkFailureAction | FavoriteBookmarkClearAction
   | ModifyTagsAction | ModifyTagsSuccessAction | ModifyTagsFailureAction | ModifyTagsClearAction
   | RenameTagAction | RenameTagSuccessAction | RenameTagFailureAction | RenameTagClearAction
   | DeleteTagAction | DeleteTagSuccessAction | DeleteTagFailureAction | DeleteTagClearAction
   | SortBookmarksAction
   | SetFilterAndTagsAction | SetFilterOrTagsAction | SetFilterNotTagsAction | SetContentFilterAction 
   | SetFilterArchiveAction | SetFilterFavoriteAction | SetFilterSelectedAction
   | ClearFiltersAction | SelectAction
   | ExportAction | ExportSuccessAction | ExportFailureAction | ExportClearAction;

// END ACTIONS

// ACTION CREATORS

function persistedAction<T extends BookmarkAction>(
   fn: (
      dispatch: StoreDispatch, 
      getState: () => AppState,
      persister: BookmarkPersister
   ) => Promise<T>
): MyThunkResult<Promise<T>> {
    return (dispatch: StoreDispatch, getState: () => AppState) => {
        const persister = selectors.selectBookmarkPersister(getState());
        let action = fn(dispatch, getState, persister);
        
        if(persister.postUpdateSync) {
            action = action.then(async r => {
                const newState = getState();
                const newBookmarks = selectors.selectBookmarks(newState);
               if (persister.postUpdateSync) {
                  await persister.postUpdateSync(newBookmarks);
               }
                return r;
            }); 
        }
        return action;
    };
}

export const actionCreators = {
    loadBookmarks: (
       sourcedBookmarks: SourcedBookmarks
    ): LoadBookmarksAction => ({
         type: ActionType.LOAD,
         sourcedBookmarks
    }),

    sortBookmarks: (
        field: BookmarkSortField,
        ascendingOrder = true,
    ): SortBookmarksAction => ({
        type: ActionType.SORT,
        field,
        ascendingOrder,
    }),

    setAndFilter: (tags: string[]): SetFilterAndTagsAction => ({
        type: ActionType.FILTER_AND_TAGS, tags,
    }),
    setOrFilter: (tags: string[]): SetFilterOrTagsAction => ({
        type: ActionType.FILTER_OR_TAGS, tags,
    }),
    setNotFilter: (tags: string[]): SetFilterNotTagsAction => ({
        type: ActionType.FILTER_NOT_TAGS, tags,
    }),
    setContentFilter: (q: string): SetContentFilterAction => ({
        type: ActionType.FILTER_CONTENT, q
    }),
    setArchiveFilter: (archived: boolean|undefined): SetFilterArchiveAction => ({
        type: ActionType.FILTER_ARCHIVE, archived
    }),
    setFavoriteFilter: (favorite: boolean|undefined): SetFilterFavoriteAction => ({
        type: ActionType.FILTER_FAVORITE, favorite
    }),
    setSelectedFilter: (selected: boolean|undefined): SetFilterSelectedAction => ({
        type: ActionType.FILTER_SELECTED, selected
    }),

    select: (selected: boolean, bookmarkIds?: BookmarkKeys): SelectAction => ({
        type: ActionType.SELECT, selected, bookmarkIds
    }),
    
    get add() {
        return (bookmarks: BookmarkSeed[]): MyThunkResult<Promise<AddBookmarkSuccessAction>> => {
            return persistedAction((dispatch, getState, persister) =>
                dispatch(
                   createPromiseAction({
                       startType: ActionType.ADD,
                       successType: ActionType.ADD_SUCCESS,
                       failureType: ActionType.ADD_FAILURE,
                       promise: () =>
                          persister.add
                             ? persister.add(bookmarks)
                             : Promise.reject(Error("Unsupported bookmark operation.")),
                       payload: { bookmarks } as AddBookmarkActionPayload,
                   }),
                )
            );
        };
    },

    remove: (keys: BookmarkKeys): MyThunkResult<Promise<RemoveBookmarkSuccessAction>> => {
        return persistedAction((dispatch, getState, persister) =>
           dispatch(
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
           )
        );
    },

    archive: (
       input: BookmarkToggleActionPayload,
    ): MyThunkResult<Promise<ArchiveBookmarkSuccessAction>> => {
        const { keys, status } = input;
        return persistedAction((dispatch, getState, persister) =>
           dispatch(
              createPromiseAction({
                  startType: ActionType.ARCHIVE,
                  successType: ActionType.ARCHIVE_SUCCESS,
                  failureType: ActionType.ARCHIVE_FAILURE,
                  promise: () =>
                     persister.archive
                        ? persister.archive(keys, status)
                        : Promise.reject(Error("Unsupported bookmark operation.")),
                  payload: input,
              }),
           )
        );
    },

    favorite: (
        input: BookmarkToggleActionPayload,
    ): MyThunkResult<Promise<FavoriteBookmarkSuccessAction>> => {
        const { keys, status } = input;
        return persistedAction((dispatch, getState, persister) =>
           dispatch(
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
           )
        );
    },

    modifyTags: (
        input: ModifyTagsActionPayload,
    ): MyThunkResult<Promise<ModifyTagsSuccessAction>> => {
        const { keys, tags, operation } = input;
        return persistedAction((dispatch, getState, persister) =>
           dispatch(
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
           )
        );
    },

    renameTag: (input: RenameTagActionPayload): MyThunkResult<Promise<RenameTagSuccessAction>> => {
        const { newTag, oldTag } = input;
        return persistedAction((dispatch, getState, persister) =>
           dispatch(
              createPromiseAction({
                  startType: ActionType.RENAME_TAG,
                  successType: ActionType.RENAME_TAG_SUCCESS,
                  failureType: ActionType.RENAME_TAG_FAILURE,
                  promise: () =>
                     persister.renameTag
                        ? persister.renameTag(oldTag, newTag)
                        : Promise.reject(Error("Unsupported bookmark operation.")),
                  payload: input,
              })
           )
        );
    },

    deleteTag: (input: DeleteTagActionPayload): MyThunkResult<Promise<DeleteTagSuccessAction>> => {
        const { tag } = input;
        return persistedAction((dispatch, getState, persister) =>
           dispatch(
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
           )
        );
    },
    
    clearFilters: () => ({type:ActionType.CLEAR_FILTERS}) as ClearFiltersAction,

   importFromPocket: (): MyThunkResult<Promise<LoadBookmarksAction>> =>
      async (dispatch: StoreDispatch, _) => {
         return dispatchLoad(dispatch, await pocketApi.retrieve({}), BookmarkSourceType.pocket, true);
      },

   importFromLocalStorage: (collectionId: string): MyThunkResult<Promise<LoadBookmarksAction>> =>
      async (dispatch: StoreDispatch, getState: () => AppState) => {
         const persister = createLocalBookmarkPersister(collectionId, selectBookmarks(getState()));
         return dispatchSourcedBookmarks(dispatch, await persister.getBookmarks());
      },

   importFromReadonlyJson: (serializedBookmarkCollection: string, trusted: boolean): MyThunkResult<LoadBookmarksAction> =>
      (dispatch: StoreDispatch, _) => {
         const importer = new BookmarkImporter();
         importer.addJson(serializedBookmarkCollection);
         return dispatchLoad(dispatch, importer.collection, BookmarkSourceType.readonlyJson, trusted);
      },

   importFromFirebase: (bookmarks: BookmarkCollection, owned: boolean, trusted: boolean): MyThunkResult<LoadBookmarksAction> =>
      (dispatch: StoreDispatch, _) => {
         const type = owned ? BookmarkSourceType.ownedFirebase : BookmarkSourceType.readonlyFirebase;
         return dispatchLoad(dispatch, bookmarks, type, trusted);
      },
   
   exportToPocket: (payload: ExportActionPayload): MyThunkResult<Promise<ExportSuccessAction>> => 
      (dispatch: StoreDispatch) => {
         const {transferOnCompletion,sourcedBookmarks} = payload;
         return dispatch(createPromiseAction({
            startType: ActionType.EXPORT,
            successType: ActionType.EXPORT_SUCCESS,
            failureType: ActionType.EXPORT_CLEAR,
            promise: async () => {
               const addResult = await pocketApi.addBookmarks(sourcedBookmarks.bookmarks);
               if(transferOnCompletion) {
                  const bookmarks = await pocketApi.retrieve({});
                  const action = actionCreators.loadBookmarks({bookmarks, source: sourcedBookmarks.source});
                  dispatch(action);
               } 
               return addResult as ExportActionResult;
            },
            payload,
         }));
      },
   
   

   exportToBrowserBookmarksFile: (payload: ExportActionPayload, treatTagsAsFolders: boolean): MyThunkResult<ExportActionResult> =>
      (dispatch: StoreDispatch) => {
         const {sourcedBookmarks: {bookmarks, source}, transferOnCompletion} = payload;

         const filename = `${yyyymmdd()}-exported-bookmarks.html`;
         const addedBookmarks = toBookmarkArray(bookmarks);
         const html = exportToBrowserBookmarksHtml(addedBookmarks, {treatTagsAsFolders})
         downloadFile(filename, html);
         if(transferOnCompletion) {
            const action = actionCreators.loadBookmarks(payload.sourcedBookmarks);
            dispatch(action);
         }
         const results = createPartialSuccessResult(false);
         results.successfulIds = Object.keys(bookmarks);
         return { addedBookmarks, results  } as ExportActionJsonResult;
      },

   exportToJsonFile: (payload: ExportActionPayload, treatTagsAsFolders: boolean): MyThunkResult<ExportActionJsonResult> =>
      (dispatch: StoreDispatch) => {
         const {sourcedBookmarks: {bookmarks}, transferOnCompletion} = payload;
         const filename = `${yyyymmdd()}-exported-bookmarks.json`;
         const json = JSON.stringify(bookmarks);
         downloadFile(filename, json);
         if(transferOnCompletion) {
            const action = actionCreators.loadBookmarks(payload.sourcedBookmarks);
            dispatch(action);
         }
         
         const results = createPartialSuccessResult(false);
         results.successfulIds = Object.keys(bookmarks);
         return { addedBookmarks: toBookmarkArray(bookmarks), results, json  } as ExportActionJsonResult;
      },
      
      exportToFirebase: () => 
         (dispatch: StoreDispatch) => {
            
            
         }
      
};


function dispatchSourcedBookmarks(dispatch: StoreDispatch, sourcedBookmarks: SourcedBookmarks) {
   const action = actionCreators.loadBookmarks(sourcedBookmarks);
   return dispatch(action);
}

function dispatchLoad(
   dispatch: StoreDispatch, 
   bookmarks: BookmarkCollection,
   type: BookmarkSourceType,
   trusted: boolean
) {
   const source = createBookmarkSource(type, trusted); 
   const sourcedBookmarks: SourcedBookmarks = { bookmarks, source };
   return dispatchSourcedBookmarks(dispatch, sourcedBookmarks);
}


// END ACTION CREATORS
