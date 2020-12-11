// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
import {BookmarkSourceType, SourcedBookmarks, SourceTrustLevel,} from "../../redux/bookmarks/reducer";
import React, {useState} from "react";
import {ImportPanelChildProps, makeImportForm, useSubmitHandlerCreator} from "./ActionPanel";
import {Divider, Typography} from "@material-ui/core";
import {FirebaseAuth} from "../firebase/FirebaseAuth";
import {useFirebaseDb} from "../../api/firebase/firebase";
import UserBookmarkCollections, {
   CreateBookmarkCollection,
   SelectBookmarkCollection
} from "../firebase/UserBookmarkCollections";
import {useStoreDispatch} from "../../redux/store/configureStore";
import {ciEquals} from "../../utils";

export type FirebaseImporterProps = ImportPanelChildProps & { };
/**
 * Imports raw BookmarkCollection JSON from a text area control
 * @constructor
 */
export const FirebaseImporter: React.FC<FirebaseImporterProps> = ({
   setHandler
}) => {
   const dispatch = useStoreDispatch();
   const { 
      userData, user, createBookmarkSet, favoriteBookmarkEntry, getBookmarkEntry
   } = useFirebaseDb();
   const [selectedBookmarks, setSelectedBookmarks] = useState<Nullable<SourcedBookmarks>>(null);
   
   const [recentlyCreatedId, setRecentlyCreatedId] = useState("");
   
   useSubmitHandlerCreator(
      !!selectedBookmarks,
      setHandler,
      () => {
         return selectedBookmarks
            ? Promise.resolve(selectedBookmarks)
            : Promise.reject(Error("No bookmarks selected."));   
      },
      [selectedBookmarks]
   );
   
   const handleSelection = async (id: string) => {
      if(!userData) {
         throw Error("No user data available.");
      }
      const {favorites, owned} = userData;
      const entry = await getBookmarkEntry(id);
      setSelectedBookmarks({
         bookmarks: entry.bookmarks || {},
         source: {
            bookmarkSetId: id,
            trusted: owned[id] || favorites[id] ? SourceTrustLevel.trusted : SourceTrustLevel.untrusted,
            description: `${entry.title} (Cloud)`,
            type: owned[id] ? BookmarkSourceType.ownedFirebase : BookmarkSourceType.readonlyFirebase
         }
      });
   };
   
  
   const unavailableValues = userData 
      ? [
         ...Object.values(userData.favorites).map(x => x.toLocaleUpperCase()),
         ...Object.values(userData.owned).map(x => x.title.toLocaleUpperCase())
      ]
      : [];

   return (
      <div>
        <FirebaseAuth/>
        <Divider style={{margin:5}}/>
        <Typography variant="h4">Create a Collection</Typography>
        <CreateBookmarkCollection created={setRecentlyCreatedId} unavailableValues={unavailableValues} />
        <Divider style={{margin:5}}/>
        <Typography variant="h4">Load a Collection</Typography>
        <UserBookmarkCollections highlightedId={recentlyCreatedId} onSelect={handleSelection}/>
      </div>
   );
};

export const FirebaseImporterForm = makeImportForm(FirebaseImporter, "Import from Cloud");
export default FirebaseImporterForm;