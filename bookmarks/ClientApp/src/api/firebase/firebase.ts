import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import {useCallback, useEffect, useState} from "react";
import {BookmarkCollection, BookmarkData, toBookmarkArray} from "../../redux/bookmarks/bookmarks";
import {
   AddBookmarkResults,
   BookmarkKeys,
   BookmarkPersister,
   BookmarkSeed,
   TagModification,
   toArray
} from "../bookmark-io";
import {
   BookmarkSourceType,
   ciIndexOf,
   createPartialSuccessResult,
   PartialSuccessResult,
   PersistenceResult,
   standardizeTags
} from "../../redux/bookmarks/reducer";
import {BulkPersister, LocalBookmarkStore} from "../LocalStoragePersister";
import {InMemoryBookmarkPersister} from "../InMemoryBookmarkPersister";
import {allSettled, ciEquals, deduplicate} from "../../utils";
import {debounce} from "@material-ui/core";

// noinspection SpellCheckingInspection
const firebaseConfig = {
   apiKey: "AIzaSyD3SwXV5UlFNwTaHik3v0U8wL_Mu-1-Id0",
   authDomain: "bookmarks-c822f.firebaseapp.com",
   databaseURL: "https://bookmarks-c822f.firebaseio.com",
   projectId: "bookmarks-c822f",
   storageBucket: "bookmarks-c822f.appspot.com",
   messagingSenderId: "683540279541",
   appId: "1:683540279541:web:ecc7b8d41ddcc9c99c95bc"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

export type BookmarkEntry = {
   public: boolean;
   owner: string;
   title: string;
   bookmarks: BookmarkCollection;
   added: number;
}

export type OwnedBookmark = {
   title: string;
   public: boolean;
}

export type UserBookmarkCollections = {
   owned: {[setId: string]: OwnedBookmark};
   favorites: {[setId: string]: string};
};

export const useFirebaseUser = () =>
{
   const [user, setUser] = useState<Nullable<firebase.User>>(null);
   
   // Firebase sends intermediary events. Only capture the last one.
   const debouncedSetUser = useCallback(debounce(setUser, 500), []);
   
   useEffect(() => {
      return auth.onAuthStateChanged(debouncedSetUser);
   }, []);
   return user;
}

export const useFirebaseAuth = () => 
{
   const user = useFirebaseUser();
   const login = useCallback(
      (user: string, password: string) =>
         auth.signInWithEmailAndPassword(user, password)   
      ,[]);
   
   const sendPasswordReset = (email: string) => auth.sendPasswordResetEmail(email);
   const completePasswordReset = (code: string, password: string) => auth.confirmPasswordReset(code, password);
   
   const createAccount = useCallback(
      (email: string, password: string) => {
         return auth.createUserWithEmailAndPassword(email, password).then((userCredential: firebase.auth.UserCredential) => {
            if(userCredential.user) {
               return userCredential.user.sendEmailVerification();
            } else {
               throw Error("User could not be created.");
            }
         })
      }
      ,[]);

   const logout = () => auth.signOut();
   return {user, login, sendPasswordReset, completePasswordReset, createAccount, logout};
}

export const useFirebaseDb = () =>
{
   const user = useFirebaseUser();
   const [userData, setUserData] = useState<Nullable<UserBookmarkCollections>>(null);
   
   const getBookmarkEntry = useCallback(
      async (id: string) => {
         const entry = await database.ref(`bookmarks/${id}`).once("value");
         return entry.val() as BookmarkEntry;
      },
       []
   );

   const favoriteBookmarkEntry = useCallback(
      async (id: string, favorited: boolean) => {
         if(!user) {
            throw Error("You must authenticate to add favorite bookmarks.");
         }
         
         const ref = database.ref(`users/${user.uid}/favorites/${id}`);
         if(favorited) {
            const {title} = (await getBookmarkEntry(id));
            await ref.set(title);
         } else {
            await ref.remove();
         }
      },
      [user]
   );

   const deleteBookmarkSet = useCallback(
      async (id: string) => {
         if(!user) {
            throw Error("You must authenticate to add favorite bookmarks.");
         }

         return Promise.all([
            database.ref(`bookmarks/${id}`).remove(),
            database.ref(`users/${user.uid}/favorites/${id}`).remove(),
            database.ref(`users/${user.uid}/owned/${id}`).remove(),
         ]);
      },
      [user]
   );
   const createBookmarkSet = useCallback(
      async (title: string, isPublic: boolean, bookmarks: BookmarkCollection = {}) => {
         if(!user) {
            throw Error("You must authenticate before storing bookmarks.");
         }
         
         const bookmarkKey = database.ref("bookmarks").push().key;
         if(!bookmarkKey) {
            throw Error("Could not create key.");
         }
         
         const entry: BookmarkEntry = {
            added: new Date().getTime(),
            bookmarks,
            owner: user.uid,
            public: isPublic,
            title
         };
         
         const userDataEntry: OwnedBookmark = {public: isPublic, title}; 
         
         
         
         await Promise.all([
            database.ref(`bookmarks/${bookmarkKey}`).set(entry),
            database.ref(`users/${user.uid}/owned/${bookmarkKey}`).set(userDataEntry)
         ]);
         return bookmarkKey;
      },
      [user]
   );

   const updateBookmarkSet = useCallback(
      async (id: string, bookmarks: BookmarkCollection = {}) => {
         if(!user) {
            throw Error("You must authenticate before storing bookmarks.");
         }

         const bookmarkRef = database.ref(`bookmarks/${id}`);
         const entry: BookmarkEntry = (await bookmarkRef.get()).val();
         entry.bookmarks = bookmarks;
         await bookmarkRef.set(entry);
      },
      [user]
   );

   const togglePublic = useCallback(
      async (id: string, status: boolean) => {
         if(!user) {
            throw Error("You must authenticate first.");
         }
         
         console.log("Toggling public", `bookmarks/${id}/public`, status);
         
         await Promise.all([
            database.ref(`bookmarks/${id}/public`).set(status),
            database.ref(`users/${user.uid}/owned/${id}/public`).set(status),
         ]);
      },
      [user]
   );
   
   useEffect(() => {
      if(!user) {
         setUserData(null);
         return;
      }
      const userDataRef = database.ref(`users/${user.uid}`);
      
      // DETECT CHANGES IN USERDATA
      /**
       * 
       * @param data the available user data from firebase, null to save null, or undefined/not provided for a default empty instance.
       */
      const setPopulatedUserData = (data: Nullable<Partial<UserBookmarkCollections>>) => {
         // Empty objects aren't stored in firebase...
         if(!data && !user) {
            setUserData(null);
            return;
         }
         const initial: UserBookmarkCollections = {
            owned: {},
            favorites: {},
         };
         Object.assign(initial, data || {});
         setUserData(initial);
      };
      
      const userDataChangeHandler = async (snapshot: firebase.database.DataSnapshot) => {
            const data = snapshot.val() as UserBookmarkCollections;
            setPopulatedUserData(data || undefined);
      };
      userDataRef.on("value", userDataChangeHandler);
      
      // initialize userdata
      //userDataRef.get().then(userDataChangeHandler);

      return () => {
         userDataRef.off("value", userDataChangeHandler);
      };
   }, [user]);
   
   return {user, userData, togglePublic, getBookmarkEntry, favoriteBookmarkEntry, createBookmarkSet, updateBookmarkSet, deleteBookmarkSet};
}

export const createLocalBookmarkPersister = (collectionId: string, initialBookmarks: BookmarkCollection) => {
   const store = new LocalBookmarkStore(collectionId);
   return new BulkPersister(store, initialBookmarks, BookmarkSourceType.local);
};

export class FirebasePersister implements BookmarkPersister {
   
   private readonly setRef: firebase.database.Reference;
   
   private bookmark(bookmarkId: string): Promise<BookmarkData> {
      return this.bookmarkRef(bookmarkId)
         .once("value")
         .then(s => s.val() as BookmarkData);
   }

   private bookmarkRef(bookmarkId: string): firebase.database.Reference {
      return this.setRef.child(bookmarkId);
   }
   
   private async editBookmarks(key: BookmarkKeys, editBookmark: (bookmarkRef: firebase.database.Reference) => Promise<void>): Promise<PartialSuccessResult> {
      const keys = toArray(key);
      const result = createPartialSuccessResult(false, keys.length);
      const {failureIds,successfulIds} = result;

      const promises: Promise<any>[] = keys.map((id, i) => {
         const bookmarkRef = this.bookmarkRef(id);
         return editBookmark(bookmarkRef).then(() => {
            successfulIds[i] = id;            
         }, reason => {
            failureIds[i] = {id, error: String(reason)}
         });
      });
      
      const  _ = await allSettled(promises);
      return result;
   }
   
   private createTempPersister() {
      const newBookmarkKey = () => this.setRef.push().key || "";
      return new InMemoryBookmarkPersister(this.localBookmarkSnapshot, BookmarkSourceType.readonlyFirebase, newBookmarkKey);
   }

   /**
    * Finalized changes made to an in-memory persister to the Firebase db to avoid duplicating logic.
    * @param results The results returned from changes made using another (e.g. InMemoryPersister) persister.
    * @param action The action to perform in Firebase analogous to the one performed by the temporary persister.
    * @private
    */
   private finalizeTempPersisting(
      results: PartialSuccessResult, 
      action: ({bookmarkRef, id, index}: {bookmarkRef: firebase.database.Reference, id: string, index: number}) => Promise<void>
   ) {
      const promises = results.successfulIds
         .map((id,index) => {
            if(!id) {
               return Promise.resolve(false);
            }
            
            const bookmarkRef = this.bookmarkRef(id);
            return action({bookmarkRef, id, index}).then(
               () => true,
               error => {
                  results.failureIds[index] = {id, error};
                  return false;
               }
            );
         });
      return allSettled(promises).then(() => results);
   }
   
   constructor(private collectionId: string, private localBookmarkSnapshot: BookmarkCollection) {
      if(!collectionId) {
         throw Error("The Firebase collection id is empty.");
      }
      this.setRef = database.ref(`bookmarks/${collectionId}/bookmarks`);  
   }
   
   // TODO: Add validation
   public async add(bookmark: OneOrMany<BookmarkSeed>): Promise<AddBookmarkResults> {
      const tmpPersister = this.createTempPersister();
      const results = await tmpPersister.add(bookmark);
      const findAddedBookmark = (id: string) => results.addedBookmarks.find(b => b.id === id);

      results.results = await this.finalizeTempPersisting(
         results.results,
         ({bookmarkRef, id }) => bookmarkRef.set(findAddedBookmark((id))));
      return results;
   }

   public archive(keys: BookmarkKeys, status: boolean): Promise<PartialSuccessResult> {
      return this.editBookmarks(keys, ref => ref.child("archive").set(status));
   }

   public async deleteTag(tag: string): Promise<PersistenceResult> {
      const bookmarks = toBookmarkArray(this.localBookmarkSnapshot);
      const affectedKeys = bookmarks.filter(b => ciIndexOf(tag, b.tags) >= 0).map(b => b.id);
      await this.modifyTags(affectedKeys, tag, TagModification.remove);
      return {dirtyChange: false};
   }

   public favorite(keys: BookmarkKeys, status: boolean): Promise<PartialSuccessResult> {
      return this.editBookmarks(keys, ref => ref.child("favorite").set(status));
   }

   public async modifyTags(keys: BookmarkKeys, tags: string, operation: TagModification): Promise<PartialSuccessResult> {

      const tmpPersister = this.createTempPersister();
      const results = await tmpPersister.modifyTags(keys, tags, operation);
      const findBookmark = (id: string) => this.localBookmarkSnapshot[id];

      let modifiedTags = standardizeTags(tags);

      const transformTags = (origTags: string[]): string[] => {
         switch(operation) {
            case TagModification.add:
               return origTags.concat(modifiedTags);
            case  TagModification.remove:
               return origTags.filter(t => ciIndexOf(t, modifiedTags) === -1)
            case TagModification.set:
               return modifiedTags;
            default:
               return [];
         }
      }
      
      return this.finalizeTempPersisting(results, ({id, bookmarkRef, index}) => {
         const origTags = findBookmark(id).tags;
         let newTags = transformTags(origTags);
         newTags = deduplicate(newTags);
         return bookmarkRef.child("tags").set(newTags);
      });
   }

   public remove(keys: BookmarkKeys): Promise<PartialSuccessResult> {
      return this.editBookmarks(keys, ref => ref.remove());
   }

   public async renameTag(oldTag: string, newTag: string): Promise<PersistenceResult> {
      if(ciEquals(oldTag, newTag)) {
         return {dirtyChange:false};
      }
      const bookmarks = toBookmarkArray(this.localBookmarkSnapshot);
      const affectedKeys = bookmarks.filter(b => ciIndexOf(oldTag, b.tags) >= 0).map(b => b.id);
      await Promise.all([
         await this.modifyTags(affectedKeys, newTag, TagModification.add),
         await this.modifyTags(affectedKeys, oldTag, TagModification.remove)
      ]);
      return {dirtyChange: false};
   }

   sourceType: BookmarkSourceType = BookmarkSourceType.ownedFirebase;
} 

export default {};