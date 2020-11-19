// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
import { useStoreDispatch} from "../../redux/store/configureStore";
import { BookmarkSourceType, SourceTrustLevel,} from "../../redux/bookmarks/reducer";
import {actionCreators} from "../../redux/bookmarks/actions";
import React, {useState} from "react";
import TextField from "@material-ui/core/TextField";
import {connect} from "react-redux";
import {BookmarkImporterCard} from "./Importers";
import { AlertTitle, Alert } from "@material-ui/lab";

export type JsonImporterProps = { };
/**
 * Imports raw BookmarkCollection JSON from a text area control
 * @constructor
 */
export const JsonImporter: React.FC<JsonImporterProps> = () => {
   const sample = `[
      {"url":"https://example.com","title":"Example","tags":["example"]},
      {"url":"https://yahoo.com","title":"Yahoo","tags":["search", "email"]},
      {"url":"https://docs.microsoft.com/en-us/","title":"MSDN","tags":["microsoft","docs","programming"]}
   ]`;
   const [value, setValue] = useState<string>(sample);
   const [error, setError] = useState<string>("");
   const dispatch = useStoreDispatch();
   
   const changeHandler = (
      event: React.ChangeEvent<HTMLTextAreaElement>,
   ): void => {
      setValue(event.target.value);
   };
   
   const handleSubmit = () => {
      try {
         const action = actionCreators.loadSerializedBookmarks(
            value, {
               type: BookmarkSourceType.readonlyJson,
               description: "Parsed from Text",
               bookmarkSetIdentifier: "From Raw Text",
               trusted: SourceTrustLevel.warnedUntrusted
            });
         dispatch(action);
      } catch (e) {
         console.log(e);
         setError("There was an error parsing your bookmarks.");
      }
   };
   
   return (
      <BookmarkImporterCard
         header="JSON Import"
         onImportBookmarks={handleSubmit}
      >
         {error &&
            <Alert severity="error">
               <AlertTitle>Error</AlertTitle>
               {error}
            </Alert>
         }
         <TextField
            id="import-json"
            label="Bookmark Data"
            multiline
            defaultValue={value}
            onChange={changeHandler}
            variant="outlined"
            rows="20"
            style={{width: "100%"}}
         />
      </BookmarkImporterCard>
   );
};


export default JsonImporter;

