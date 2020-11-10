import { BookmarkCollection } from "../redux/bookmarks/bookmarks";
import { BookmarkSource, BookmarkSourceType, PartialSuccessResult } from "../redux/bookmarks/reducer";
export declare const toArray: (keys: BookmarkKeys) => string[];
export declare type BookmarkKeys = string | string[];
export declare enum TagModification {
    set = 0,
    add = 1,
    remove = 2
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
export interface BookmarkPersister {
    sourceType: BookmarkSourceType;
    refresh?: () => Promise<BookmarkCollection>;
    add?: (bookmark: AddBookmarkInput | AddBookmarkInput[]) => Promise<PartialSuccessResult>;
    remove?: (keys: BookmarkKeys) => Promise<PartialSuccessResult>;
    archive?: (keys: BookmarkKeys, status: boolean) => Promise<PartialSuccessResult>;
    favorite?: (keys: BookmarkKeys, status: boolean) => Promise<PartialSuccessResult>;
    /**
     * Modifies the current bookmark tag set.
     * @param key The bookmark id
     * @param tags A comma-delimited list of tags
     * @param operation What to do with the provided tags
     */
    modifyTags?: (keys: BookmarkKeys, tags: string, operation: TagModification) => Promise<PartialSuccessResult>;
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
export declare const noopBookmarkPersister: Partial<BookmarkPersister>;
