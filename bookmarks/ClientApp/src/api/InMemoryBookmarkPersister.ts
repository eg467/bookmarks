import {BookmarkCollection, BookmarkData} from "../redux/bookmarks/bookmarks";
import {
   BookmarkSourceType,
   createPartialSuccessResult,
   PartialSuccessResult,
   PersistenceResult
} from "../redux/bookmarks/reducer";
import {ciEquals, deduplicate, newId} from "../utils";
import {
   AddBookmarkResults,
   BookmarkKeys,
   BookmarkPersister,
   BookmarkSeed,
   standardizeBookmarkSeed,
   TagModification,
   toArray
} from "./bookmark-io";

/**
 * Doesn't persist data, but marks changes as dirty and allows them to be applied by later exports.
 * Returns all added bookmarks plus pre-existing bookmarks with tags merged.
 */
export class InMemoryBookmarkPersister implements  BookmarkPersister {
   constructor(
      private readonly bookmarks: BookmarkCollection, 
      public readonly sourceType: BookmarkSourceType = BookmarkSourceType.readonlyJson,
      private readonly idGenerator: ((bookmarks: BookmarkCollection) => string) = newId
   ) {
   }

   private createDirtyPartialSuccessResultPromise  = (
      keys: BookmarkKeys
   ) => {
      const result = this.createDirtyPartialSuccessResult(keys);
      return Promise.resolve(result);
   };

   private createDirtyPartialSuccessResult = (
      keys: BookmarkKeys,
   ): PartialSuccessResult => {
      const result: PartialSuccessResult = {
         dirtyChange: true,
         successfulIds: [],
         failureIds: []
      };
      const {successfulIds, failureIds} = result;
      toArray(keys).forEach(id => {
         const hasKey = !!this.bookmarks[id];
         successfulIds.push(hasKey ? id : null);
         failureIds.push(hasKey ? null : {error: "Invalid bookmark ID specified."});
      });
      return result;
   };

   private findByUrl(url: string) {
      const bookmarks = Object.values(this.bookmarks);
      return bookmarks.find((v) => ciEquals(v.url, url));
   }
   
   private static mergeTags(bookmark: BookmarkData, newTags: string[]): BookmarkData {
      return {...bookmark, tags: deduplicate([...bookmark.tags, ...newTags])};
   }
   
   private createBookmark(seed: BookmarkSeed) {
      return ({
         id: this.idGenerator(this.bookmarks),
         url: seed.url, 
         tags: seed.tags
      } as BookmarkData);
   }
   
   private findOrCreate(seed: BookmarkSeed): BookmarkData {
      let existing = this.findByUrl(seed.url);
      return existing
         ? InMemoryBookmarkPersister.mergeTags(existing, seed.tags)
         : this.createBookmark(seed);
   }

   add(bookmarkSeed: OneOrMany<BookmarkSeed>) {
      const fullResults: AddBookmarkResults = {
         addedBookmarks: [],
         results: createPartialSuccessResult(true),
      };
      
      const { addedBookmarks, results: {successfulIds, failureIds} } = fullResults;

      toArray(bookmarkSeed).forEach(seed => {
         try {
            const goodSeed = standardizeBookmarkSeed(seed);
            const newBookmark = this.findOrCreate(goodSeed);
            addedBookmarks.push(newBookmark);
            successfulIds.push(newBookmark.id);
            failureIds.push(null);
         } catch(e) {
            const error = `Failed to parse new bookmark with URL: '${seed.url}' and TAGS: '${seed.tags.join(", ")}'.`;
            console.error(error, e);
            successfulIds.push(null);
            failureIds.push({ error });
         } 
      });
      
      return Promise.resolve(fullResults);
   }
   remove(keys: BookmarkKeys)  {
      return this.createDirtyPartialSuccessResultPromise(keys);
   }
   archive(keys: BookmarkKeys, _: boolean)  {
      return this.createDirtyPartialSuccessResultPromise(keys);
   }
   favorite(keys: BookmarkKeys, _: boolean)  {
      return this.createDirtyPartialSuccessResultPromise(keys);
   }
   modifyTags(keys: BookmarkKeys, _: string, _2: TagModification)  {
      return this.createDirtyPartialSuccessResultPromise(keys);
   }
   renameTag(_: string, _2: string)  {
      return Promise.resolve<PersistenceResult>({dirtyChange: true})
   }
   deleteTag(_: string)  {
      return Promise.resolve<PersistenceResult>({dirtyChange: true})
   }
}
