// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
import {
   BookmarkSourceType,
   createBookmarkSource,
   SourcedBookmarks,
   SourceTrustLevel,
} from "../../redux/bookmarks/reducer";
import {actionCreators} from "../../redux/bookmarks/actions";
import React, {useState} from "react";
import TextField from "@material-ui/core/TextField";
import {ImportPanelChildProps, makeImportForm, useSubmitHandlerCreator} from "./ActionPanel";
import {BookmarkImporter} from "../../api/BookmarkImporter";
import {FormControlLabel, FormLabel} from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";

export type JsonImporterProps = ImportPanelChildProps & { };
/**
 * Imports raw BookmarkCollection JSON from a text area control
 * @constructor
 */
export const JsonImporter: React.FC<JsonImporterProps> = ({
   setHandler
}) => {
   const sample = `[
      {"url":"https://example.com","title":"Example","tags":["example"]},
      {"url":"https://yahoo.com","title":"Yahoo","tags":["search", "email"]},
      {"url":"https://docs.microsoft.com/en-us/","title":"MSDN","tags":["microsoft","docs","programming"]}
   ]`;

   const [trusted, setTrusted] = useState(false);
   const [value, setValue] = useState(sample);

   useSubmitHandlerCreator(
      !!value,
      setHandler,
      () => {
         try {
            const action = actionCreators.importFromReadonlyJson(value, trusted);
            const importer = new BookmarkImporter();
            importer.addJson(value);
            const bookmarks = importer.collection;
            const source = createBookmarkSource(BookmarkSourceType.readonlyJson, trusted, "Parsed from text");
            const sourcedBookmarks: SourcedBookmarks = {bookmarks, source};
            return Promise.resolve(sourcedBookmarks);
         } catch (e) {
            return Promise.reject(Error("There was an error parsing your bookmarks."));
         }
      },
      [value, trusted]
      );
   
   return (
      <div>
         <div>
            <TextField
               id="import-json"
               label="Bookmark Data"
               multiline
               defaultValue={value}
               onChange={event => setValue(event.target.value)}
               variant="outlined"
               rows="20"
               style={{width: "100%"}}
            />
         </div>
         <div>
            <FormControlLabel
               control={<Checkbox checked={trusted} onChange={e => setTrusted(e.target.checked)} />}
               label="Do you trust the source of these URLs?"
            />
         </div>
      </div>
   );
};

export const JsonImporterForm = makeImportForm(JsonImporter, "Import Raw JSON");
export default JsonImporterForm;