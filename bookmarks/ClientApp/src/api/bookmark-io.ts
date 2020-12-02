import { BookmarkCollection, BookmarkData } from "../redux/bookmarks/bookmarks";
import {
    BookmarkSource,
    BookmarkSourceType,
    PartialSuccessResult,
    PersistenceResult, 
    standardizeTags
} from "../redux/bookmarks/reducer";
import { standardizeUrl } from "../utils";

export const toArray = <T>(keys: OneOrMany<T>) => Array.isArray(keys) ? keys : [keys];
export type BookmarkKeys = OneOrMany<string>;
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
    input: BookmarkSeed;
}

export interface BookmarkSeed {
    url: string;
    tags: string[];
}

export const isUrl = (url: string) => {
    try {
        let _ = new URL(url);
        return true
    } catch(_) {
        return false;
    }
};

export const standardizeBookmarkSeed = (seed: BookmarkSeed): BookmarkSeed => ({
    url: standardizeUrl(seed.url),
    tags: standardizeTags(seed.tags)
});

export type AddBookmarkResults =  {
    addedBookmarks: BookmarkData[];
    results: PartialSuccessResult;
}

export interface BookmarkPersister {
    sourceType: BookmarkSourceType;

    /**
     * Some data sources, eg. local storage work better storing all bookmarks in bulk after changes in redux store.
     * (As opposed to Pocket, which accepts individual requests.)
     */
    postUpdateSync?: (Bookmarks: BookmarkCollection)=>Promise<void>;
    
    add?: (bookmark: BookmarkSeed | BookmarkSeed[]) => Promise<AddBookmarkResults>;
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
    renameTag?: (oldTag: string, newTag: string) => Promise<PersistenceResult>;

    /**
      * Delete a tag. This affects all items with this tag.
      * @param tag The name of the tag to delete.
      */
    deleteTag?: (tag: string) => Promise<PersistenceResult>;
}




