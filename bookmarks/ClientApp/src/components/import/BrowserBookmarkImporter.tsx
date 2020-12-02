import * as React from 'react';
import FileUpload, {FileContents} from "../common/FileUpload";
import {useState, Fragment, useCallback} from "react";
import {Alert, AlertTitle} from "@material-ui/lab";
import {
   bookmarkTreeToCollection,
   BrowserBookmarkTree,
   importHtml
} from "../../api/BrowserBookmarkConverter";
import {Checkbox, createStyles, debounce, FormControlLabel, makeStyles} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Select from "../tags/Select";
import {BookmarkCollection, BookmarkData} from "../../redux/bookmarks/bookmarks";
import {Theme} from "@material-ui/core/styles";
import {ImportPanelChildProps, makeImportForm, useSubmitHandlerCreator} from "./ActionPanel";
import {
   BookmarkSourceType,
   createBookmarkSource,
   SourcedBookmarks
} from "../../redux/bookmarks/reducer";
import BookmarkSelectionTree from "./BookmarkSelectionTree";
import {JsonImporter} from "./JsonImporter";

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      
      formLabel: {
         display: "block",
         margin: theme.spacing(1),
      },
      
      filter: {
         display: "block",
         margin: theme.spacing(1),
      }
      
   }));

export type BrowserBookmarkImporterProps = ImportPanelChildProps & {};

type State = {
   error: string;
   defaultTags: string[];
   excludedTags: string[];
   dirsAsTags: boolean;
   tree: Nullable<BrowserBookmarkTree>;
   selectedBookmarks: BookmarkCollection
   bookmarkTreeFilter: string;
};

export const BrowserBookmarkImporter: React.FC<BrowserBookmarkImporterProps> = ({setHandler}) => {
   const [state, setState] = useState<State>({
      defaultTags: [],
      dirsAsTags: true,
      error: "",
      excludedTags: [],
      tree: null,
      selectedBookmarks: {},
      bookmarkTreeFilter: "",
      
   });
   
   const [debouncedFilter, setDebouncedFilter] = useState(state.bookmarkTreeFilter);
   const setFilterDebounced = useCallback(debounce(setDebouncedFilter, 750), []);
   
   const classes = useStyles();
   const {error,tree,excludedTags,dirsAsTags,defaultTags, selectedBookmarks} = state;
   
   const handleUpload = (file: Promise<FileContents>) => {
      file.then(x => {
         const parsedTree: BrowserBookmarkTree = importHtml(x.contents, {});
         setState(s=>({...s, tree: parsedTree, selectedSubtree: parsedTree}))
      }).catch(
         e => setState(s => ({...s, error: String(e)}))
      );
   }
   
   

   console.log("selected bookmark length:", Object.keys(selectedBookmarks).length);
   useSubmitHandlerCreator(
      Object.keys(selectedBookmarks).length > 0,
      setHandler,
      () => {
         try {
            if(!state.tree) {
               // noinspection ExceptionCaughtLocallyJS
               throw Error();
            }
            const bookmarks = bookmarkTreeToCollection(state.tree, {
               addedTags: defaultTags,
               removedTags: excludedTags,
               includeBookmark: (b: BookmarkData) => !!selectedBookmarks[b.id],
               preserveTimestamps: true, 
               subdirsAsTags: dirsAsTags});
            const source = createBookmarkSource(BookmarkSourceType.browserBookmarks, true, "Browser Bookmarks");
            return Promise.resolve({bookmarks, source} as SourcedBookmarks);
         } catch (e) {
            return Promise.reject(Error("There was an error parsing your bookmarks."));
         }
      },
      [state.tree, state.excludedTags, state.defaultTags, state.dirsAsTags, selectedBookmarks]
   );
   
   const handleSelectionChange = (selectedBookmarks: BookmarkCollection) => {
      setState(s => ({...s, selectedBookmarks }))
   }

   const handleSetFilter = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const bookmarkTreeFilter = event.target.value;
      setState(s => ({...s, bookmarkTreeFilter}))
      setFilterDebounced(bookmarkTreeFilter);
   };
   
   const handleDirsAsTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((s: State) => ({...s, dirsAsTags: e.target.checked}));
   }
   
   return (
      <div>
         {error &&
         <Alert severity="error">
             <AlertTitle>Error</AlertTitle>
            {error}
         </Alert>
         }

         <h4>Upload</h4>
         <FileUpload onUpload={handleUpload} />
         
         {tree && (
            <Fragment>
               <h4>Bookmarks</h4>
               <TextField 
                  label="Filter"
                  variant="outlined"
                  size="small"
                  className={classes.filter}
                  value={state.bookmarkTreeFilter}
                  onChange={handleSetFilter} 
               />
               <BookmarkSelectionTree 
                  root={tree}
                  onSelectionChange={handleSelectionChange} 
                  filter={debouncedFilter}  
               />

               <h4>Tags</h4>
               <FormControlLabel
                  labelPlacement="top"
                  className={classes.formLabel}
                  control={<Checkbox checked={dirsAsTags} onChange={handleDirsAsTagsChange} />}
                  label={`Include directories as tags`}
               />

               <FormControlLabel
                  labelPlacement="top"
                  className={classes.formLabel}
                  control={<Select id="default-imported-tags" valueStrings={defaultTags} onChangedStrings={e => setState((s: State) => ({...s, defaultTags: e}))}/>}
                  label={`Default Tags`}
               />

               <FormControlLabel
                  labelPlacement="top"
                  className={classes.formLabel}
                  control={<Select id="excluded-imported-tags" valueStrings={excludedTags} onChangedStrings={e => setState((s: State) => ({...s, excludedTags: e}))}/>}
                  label={`Excluded Tags`}
               />
            </Fragment>
         )}
         
      </div>
   );
};

export const BrowserBookmarkImporterForm = makeImportForm(BrowserBookmarkImporter, "Browser Bookmarks");
export default BrowserBookmarkImporterForm;