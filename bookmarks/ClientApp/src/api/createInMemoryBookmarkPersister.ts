import {BookmarkCollection, BookmarkData} from "../redux/bookmarks/bookmarks";
import {
   BookmarkSourceType,
   createDirtyPartialSuccessResultPromise, FailedIndividualRequest,
   PartialSuccessResult
} from "../redux/bookmarks/reducer";
import {ciEquals, deduplicate} from "../utils";
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
export const createInMemoryBookmarkPersister =
   (currentBookmarks: BookmarkCollection): BookmarkPersister => ({
      sourceType: BookmarkSourceType.readonlyJson,
      add: (bookmarkSeed: BookmarkSeed | BookmarkSeed[]) => {
         const bookmarkSeeds = toArray(bookmarkSeed);

         let currentIdx = 0;
         const makeBookmark = (seed: BookmarkSeed) => {
            let id: string;
            while(currentBookmarks[id = `temp-${currentIdx++}`.padStart(4, "0")]) { }
            return ({id, url: seed.url, tags: seed.tags} as BookmarkData);
         }

         const existingBookmarks = Object.values(currentBookmarks);
         const findByUrl = (seed: BookmarkSeed) => {
            const oldBookmark = existingBookmarks.find((v) => ciEquals(v.url, seed.url));
            return oldBookmark !== undefined
               ? {
                  ...oldBookmark,
                  // Merge the new and old tags
                  tags: deduplicate([...oldBookmark.tags, ...seed.tags])
               } as BookmarkData
               : undefined;
         }
         
         const newOrExistingBookmarks: BookmarkData[] = [];
         const successfulIds: Nullable<string>[] = bookmarkSeeds.map(_ => null);
         const errorIds: Nullable<FailedIndividualRequest>[] = bookmarkSeeds.map(_ => null);
         for (let i = 0; i < bookmarkSeeds.length; i++) {
            const seed = bookmarkSeeds[i];
            try {
               const goodSeed = standardizeBookmarkSeed(seed)
               const newOrExistingBookmark = findByUrl(goodSeed) || makeBookmark(goodSeed);
               successfulIds[i] = newOrExistingBookmark.id;
               newOrExistingBookmarks.push(newOrExistingBookmark)
            } catch(e) {
               const error = `Failed to parse new bookmark with URL: '${seed.url}' and TAGS: '${seed.tags.join(", ")}'.`;
               console.error(error, e);
               errorIds[i] = { error };
            }
         }

         return Promise.resolve<AddBookmarkResults>({
            addedBookmarks: newOrExistingBookmarks,
            results: ({
               successfulIds: successfulIds,
               dirtyChange: true,
               failureIds: errorIds
            } as PartialSuccessResult)
         });
      },
      remove: (keys: BookmarkKeys) => createDirtyPartialSuccessResultPromise(keys),
      archive: (keys: BookmarkKeys, _: boolean) => createDirtyPartialSuccessResultPromise(keys),
      favorite: (keys: BookmarkKeys, _: boolean) => createDirtyPartialSuccessResultPromise(keys),
      modifyTags: (keys: BookmarkKeys, _: string, _2: TagModification) => createDirtyPartialSuccessResultPromise(keys),
      renameTag: (_: string, _2: string) => createDirtyPartialSuccessResultPromise([]),
      deleteTag: (_: string) => createDirtyPartialSuccessResultPromise([]),
   });