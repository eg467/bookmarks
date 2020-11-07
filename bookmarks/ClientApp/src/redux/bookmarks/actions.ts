import { ActionCreator } from "redux";
import { OtherAction } from "../../redux/common/actions";
import { BookmarkCollection, BookmarkSortField } from "./bookmarks";

export enum ActionType {
    SHOW_BOOKMARKS = "bookmarks/SHOW_BOOKMARKS",
    SORT_BOOKMARKS = "bookmarks/SORT_BOOKMARKS",
    SET_AND_TAGS = "bookmarks/SET_AND_TAGS",
    SET_OR_TAGS = "bookmarks/SET_OR_TAGS",
    SET_NOT_TAGS = "bookmarks/SET_NOT_TAGS",
    SET_CONTENT_FILTER = "bookmarks/SET_CONTENT_FILTER",
}

// ACTIONS

export interface ShowBookmarksAction {
    type: ActionType.SHOW_BOOKMARKS;
    bookmarks: BookmarkCollection;
    readonly: boolean;
}

export interface SortBookmarksAction {
    type: ActionType.SORT_BOOKMARKS;
    field: BookmarkSortField;
    ascendingOrder: boolean;
}

export interface SetAndTagsAction {
    type: ActionType.SET_AND_TAGS;
    tags: string[];
}

export interface SetOrTagsAction {
    type: ActionType.SET_OR_TAGS;
    tags: string[];
}

export interface SetNotTagsAction {
    type: ActionType.SET_NOT_TAGS;
    tags: string[];
}

export type BookmarkAction =
    ShowBookmarksAction | SortBookmarksAction | SetAndTagsAction
    | SetOrTagsAction | SetNotTagsAction | OtherAction;

// END ACTIONS

// ACTION CREATORS

export const actionCreators = {
    showBookmarks: (bookmarks: BookmarkCollection, readonly: boolean): ShowBookmarksAction => ({
        type: ActionType.SHOW_BOOKMARKS,
        bookmarks,
        readonly
    }),

    sortBookmarks:
        (field: BookmarkSortField, ascendingOrder: boolean = true): SortBookmarksAction => ({
            type: ActionType.SORT_BOOKMARKS,
            field,
            ascendingOrder
        }),

    setAndFilter: (tags: string[]): SetAndTagsAction => ({ type: ActionType.SET_AND_TAGS, tags }),
    setOrFilter: (tags: string[]): SetOrTagsAction => ({ type: ActionType.SET_OR_TAGS, tags }),
    setNotFilter: (tags: string[]): SetNotTagsAction => ({ type: ActionType.SET_NOT_TAGS, tags })
};

// END ACTION CREATORS