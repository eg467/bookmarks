import { BookmarkCollection, BookmarkData } from "../redux/bookmarks/bookmarks";
import { BookmarkSource, BookmarkSourceType } from "../redux/bookmarks/reducer";

export type BookmarkKeys = string | string[];
export enum TagModification {
    set, add, remove
}

export interface BookmarkImportResult {
    bookmarks: BookmarkCollection;
    source: BookmarkSource;
}

export interface BookmarkImporter {
    import: (completionCallback: (results: BookmarkImportResult) => void) => React.ReactElement;
}

export interface BookmarkExporter {
    export: (completionCallback: () => void) => React.ReactElement;
}

export interface AddBookmarkError {
    message: string;
    index: number;
    input: AddBookmarkInput;
}

export interface AddBookmarkInput {
    url: string;
    tags: string[];
}

export interface AddBookmarkResult {
    savedKeys: string[],
    errors: AddBookmarkError[];
}

export interface BookmarkPersister {
    sourceType: BookmarkSourceType;
    refresh?: () => Promise<BookmarkCollection>;

    add?: (bookmark: AddBookmarkInput | AddBookmarkInput[]) => Promise<AddBookmarkResult>;
    remove?: (keys: BookmarkKeys) => Promise<void>;
    archive?: (keys: BookmarkKeys, status: boolean) => Promise<void>;
    favorite?: (keys: BookmarkKeys, status: boolean) => Promise<void>;

    /**
     * Modifies the current bookmark tag set.
     * @param key The bookmark id
     * @param tags A comma-delimited list of tags
     * @param operation What to do with the provided tags
     */
    modifyTags?: (keys: BookmarkKeys, tags: string, operation: TagModification) => Promise<void>;

    /**
     * Rename a tag. This affects all items with this tag.
     * @param oldTag
     * @param newTag
     */
    renameTag?: (oldTag: string, newTag: string) => Promise<void>;

    /**
      * Delete a tag. This affects all items with this tag.
      * @param tag The name of the tag to delete.
      */
    deleteTag?: (tag: string) => Promise<void>;
}

export const noopBookmarkPersister: Partial<BookmarkPersister> = {};