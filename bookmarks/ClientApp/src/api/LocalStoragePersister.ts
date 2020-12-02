import {BookmarkCollection, BookmarkData} from "../redux/bookmarks/bookmarks";
import reducer, {
   BookmarkSource,
   BookmarkSourceType, createBookmarkSource,
   initialState,
   PartialSuccessResult,
   PersistenceResult,
   SourcedBookmarks,
   SourceTrustLevel
} from "../redux/bookmarks/reducer";
import {
   AddBookmarkResults,
   BookmarkKeys,
   BookmarkPersister,
   BookmarkSeed,
   TagModification,
   toArray
} from "./bookmark-io";
import storage from "./local-storage";
import {InMemoryBookmarkPersister} from "./InMemoryBookmarkPersister";
import {BookmarkAction} from "../redux/bookmarks/actions";
import pocketApi from "./pocket-api";

/**
 * Doesn't persist data, but marks changes as dirty and allows them to be applied by later exports.
 * Returns all added bookmarks plus pre-existing bookmarks with tags merged.
 */

/**
 * The bookmarks stored in local storage. The id key field doubles as a user-friendly description.
 */
export type LocallySavedBookmarks = {[id: string]: BookmarkCollection};

export class LocalStoragePersister implements BookmarkPersister {
   private static readonly savedBookmarks = storage.fieldStorage<LocallySavedBookmarks>("savedBookmarks", {});
   public readonly sourceType = BookmarkSourceType.local;
   
   // Mocks changes so they can be applied in redux.
   // Those changes are then synced after the fact.
   private tempPersister: InMemoryBookmarkPersister;
   
   constructor(private readonly collectionId: string) {
      this.tempPersister = new InMemoryBookmarkPersister(this.bookmarks);
   }
   
   public static ids(): string[] {
      return Object.keys(this.savedBookmarks);
   }
   
   public set bookmarks(value: BookmarkCollection) {
      LocalStoragePersister.bookmarkCollections[this.collectionId] = value;
   }

   public get bookmarks(): BookmarkCollection {
      return LocalStoragePersister.bookmarkCollections[this.collectionId] || {};
   }

   public static get bookmarkCollections() {
      return LocalStoragePersister.savedBookmarks.get();
   }

   public static set bookmarkCollections(value: LocallySavedBookmarks) {
      LocalStoragePersister.savedBookmarks.set(value);
   }

   public static get collectionIds(): string[] {
      return Object.keys(LocalStoragePersister.bookmarkCollections);
   }

   private modifyCollection(fn: (set: BookmarkCollection) => BookmarkCollection) {
      let collections = LocalStoragePersister.bookmarkCollections;
      collections[this.collectionId] = fn(collections[this.collectionId] || {});
      LocalStoragePersister.bookmarkCollections = collections;
   }
   
   private modifyBookmarks(bookmarkIds: BookmarkKeys, fn: (set: BookmarkData) => BookmarkData) {
      this.modifyCollection(c => {
         toArray(bookmarkIds).forEach(id => c[id] = fn(c[id]));
         return c;
      });
   }

   // Reuse the reducer logic on successful changes to an in-memory version
   private simulateAction<T extends BookmarkAction>(actionCreator: (persister: InMemoryBookmarkPersister) => Promise<T>): Promise<T> {
      const bookmarks = this.bookmarks;
      const persister = new InMemoryBookmarkPersister(bookmarks);
      return actionCreator(persister).then(action => {
         this.bookmarks = reducer({...initialState, bookmarks}, action).bookmarks
         return action;
      });
   }
   
   public postUpdateSync(bookmarks: BookmarkCollection) {
      this.bookmarks = bookmarks;
      return Promise.resolve();
   }

   public add(bookmarkSeed: OneOrMany<BookmarkSeed>): Promise<AddBookmarkResults> {
      return this.tempPersister.add(bookmarkSeed);
   }

   public archive(keys: BookmarkKeys, status: boolean): Promise<PartialSuccessResult> {
      return this.tempPersister.archive(keys, status);
   }

   public deleteTag(tag: string): Promise<PersistenceResult> {
      return this.tempPersister.deleteTag(tag);
   }

   public favorite(keys: BookmarkKeys, status: boolean): Promise<PartialSuccessResult> {
      return this.tempPersister.favorite(keys, status);
   }

   public modifyTags(keys: BookmarkKeys, tags: string, operation: TagModification): Promise<PartialSuccessResult> {
      return this.tempPersister.modifyTags(keys, tags, operation);
   };

   public renameTag(oldTag: string, newTag: string): Promise<PersistenceResult> {
      return this.tempPersister.renameTag(oldTag, newTag);
   }
   public remove(keys: BookmarkKeys): Promise<PartialSuccessResult> {
      return this.tempPersister.remove(keys);
   }
}


