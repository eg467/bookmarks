import {BookmarkCollection} from "../redux/bookmarks/bookmarks";
import {
   BookmarkSource,
   BookmarkSourceType,
   createBookmarkSource,
   PartialSuccessResult,
   PersistenceResult,
   SourcedBookmarks
} from "../redux/bookmarks/reducer";
import {AddBookmarkResults, BookmarkKeys, BookmarkPersister, BookmarkSeed, TagModification} from "./bookmark-io";
import storage from "./local-storage";
import {InMemoryBookmarkPersister} from "./InMemoryBookmarkPersister";

/**
 * Doesn't persist data, but marks changes as dirty and allows them to be applied by later exports.
 * Returns all added bookmarks plus pre-existing bookmarks with tags merged.
 */

/**
 * The bookmarks stored in local storage. The id key field doubles as a user-friendly description.
 */
export type LocallySavedBookmarks = {[id: string]: BookmarkCollection};


export type BulkBookmarkStore = {
   get: () => Promise<SourcedBookmarks>;
   // Unset if readonly source
   set?: (bookmarks: BookmarkCollection) => Promise<void>;
}

/**
 * A Bookmark set is a keyed collection of bookmarks
 */
export type BookmarkSetStore<T> = {
   create?: (collectionId: string, description: string) => Promise<SourcedBookmarks>;
   read: (collectionId: string) => Promise<SourcedBookmarks>;
   update?: (fn: (bookmarkCollections: T) => T|void) => Promise<void>;
   delete?: (collectionId: string) => Promise<void>;
   //ids: () => Promise<{id:string, description: string}[]>;
}

export class LocalBookmarkSetStore implements BookmarkSetStore<LocallySavedBookmarks>{
   private static savedBookmarks = storage.fieldStorage<LocallySavedBookmarks>("savedBookmarks", {});

   private static createLocalSource(collectionId: string, description: string): BookmarkSource {
      // collectionId is the description
      return createBookmarkSource(BookmarkSourceType.local, true, description, collectionId);
   }
   
   public async create(collectionId: string, description: string): Promise<SourcedBookmarks> {
      if(collectionId !== description) {
         throw Error("The collection ID serves as the description and must be equal.");
      }

      const bookmarks: BookmarkCollection = {};
      await this.update(c => { c[collectionId] = bookmarks; });
      return {
         bookmarks,
         source: LocalBookmarkSetStore.createLocalSource(collectionId, description)
      };
   }

   public read(collectionId: string) {
      const collections = LocalBookmarkSetStore.savedBookmarks.get();
      return Promise.resolve({
         bookmarks: collections[collectionId], 
         source: LocalBookmarkSetStore.createLocalSource(collectionId, collectionId)
      });
   }

   public update(fn: (bookmarkCollections: LocallySavedBookmarks) => LocallySavedBookmarks|void) {
      let collections = LocalBookmarkSetStore.savedBookmarks.get();
      collections = fn(collections) || collections;
      LocalBookmarkSetStore.savedBookmarks.set(collections);
      return Promise.resolve();
   }

   public async delete(collectionId: string): Promise<void> {
      await this.update(c => { delete c[collectionId]; });
      return Promise.resolve();
   }
   
   public ids(): Promise<{id:string, description: string}[]> {
      const collections = LocalBookmarkSetStore.savedBookmarks.get();
      const keyedDescriptions = Object.keys(collections).map(id => ({id, description: id}));
      return Promise.resolve(keyedDescriptions);
   }
}

export class LocalBookmarkStore implements BulkBookmarkStore {
 
   
   private static readonly store = new LocalBookmarkSetStore();
   constructor(private collectionId: string) {
   }
   
   public async get(): Promise<SourcedBookmarks> {
      return await LocalBookmarkStore.store.read(this.collectionId);
   }
   public set(bookmarks: BookmarkCollection): Promise<void> {
      return LocalBookmarkStore.store.update(c => {
         c[this.collectionId] = bookmarks;
      });
   }
}


/**
 * Mimics changes in memory, then updates after the fact
 */
export class BulkPersister extends InMemoryBookmarkPersister {
  
   // Mocks changes so they can be applied in redux.
   // Those changes are then synced after the fact.
   private readonly tempPersister: Promise<InMemoryBookmarkPersister>;
   
   constructor(
      private readonly store: BulkBookmarkStore,
      initialBookmarks: BookmarkCollection,
      sourceType: BookmarkSourceType
   ) {
      super(initialBookmarks, sourceType);
      this.tempPersister = store.get().then(initialBookmarks => new InMemoryBookmarkPersister(initialBookmarks.bookmarks));
   }
   
   public getBookmarks() {
      return this.store.get();
   }
   
   public postUpdateSync(bookmarks: BookmarkCollection) {
      return this.store.set
         ? this.store.set(bookmarks)
         : Promise.resolve();
   }
}

export const createLocalBookmarkPersister = (collectionId: string, initialBookmarks: BookmarkCollection) => {
   const store = new LocalBookmarkStore(collectionId);
   return new BulkPersister(store, initialBookmarks, BookmarkSourceType.local);
};

