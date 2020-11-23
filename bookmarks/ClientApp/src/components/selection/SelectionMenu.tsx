import React, {useEffect, useState, useRef} from "react";
import {
   Button,
   createStyles,
   makeStyles,
   Theme,
   Typography,
   List,
   ListItemText,
   ListItemIcon,
   ListItem,
   ButtonGroup,
   Divider
} from "@material-ui/core";
import {SelectedButtonGroup} from "../common/SelectedButtonGroup";
import {selectors, standardizeTags} from "../../redux/bookmarks/reducer";
import {useSelector} from "react-redux";
import {AppState} from "../../redux/root/reducer";
import {SetOps} from "../../utils";
import {actionCreators} from "../../redux/bookmarks/actions";
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";
import {BookmarkKeys, TagModification} from "../../api/bookmark-io";
import Select from "../tags/Select";
import {selectAllTagOptions} from "../tags/tag-types";

import DeleteIcon from '@material-ui/icons/Delete';
import ArchiveIcon from '@material-ui/icons/Archive';
import UnarchiveIcon from '@material-ui/icons/Unarchive';

import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import SyncIcon from '@material-ui/icons/Sync';

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      container: {
         textAlign: "center",
         "& h4": {
            margin: theme.spacing(2, .5)
         }
      },
      spaced: {
         // display:"flex",
         // flexDirection: "row",
         margin: theme.spacing(1),
         "&>*": {
            margin: theme.spacing(2)
         }
      },
      actionGroup: {
         margin: "1em auto"
      }
   })
);

type SelectionSearchProps = {
   value: Nullable<boolean>;
   setValue: (newValue: Nullable<boolean>) => void;
   locked: boolean;
};


const SearchFiltered: React.FC<SelectionSearchProps> = ({value, setValue, locked}) => {
   const options = new Map([
      ["Filtered", true],
      ["Unfiltered", false],
      ["Both", null]
   ]);

   return (
      <SelectedButtonGroup
         disabled={locked}
         options={options}
         defaultSelection={value}
         onSelectionChange={setValue}
      />
   );
};

const SearchSelected: React.FC<SelectionSearchProps> = ({value, setValue, locked}) => {
   const options = new Map([
      ["Selected", true],
      ["Unselected", false],
      ["Both", null]
   ]);

   return (
      <SelectedButtonGroup
         disabled={locked}
         options={options}
         defaultSelection={value}
         onSelectionChange={setValue}
      />
   );
};


export const SelectionMenu: React.FC<{}> = () => {
  const classes = useStyles();
  
  const dispatch = useStoreDispatch();
  const allBookmarkIds = useStoreSelector(state => selectors.selectBookmarkIds(state));
  const selectedBookmarkIds =  useStoreSelector(state => selectors.selectSelectedBookmarkIds(state));
  const filteredBookmarkIds = useStoreSelector(state => selectors.selectFilteredBookmarkIds(state));
  const allTagOptions = useStoreSelector(state => selectAllTagOptions(state));
  const [searchFiltered, setSearchFiltered] = useState<Nullable<boolean>>(null);
  const [searchSelected, setSearchSelected] = useState<Nullable<boolean>>(selectedBookmarkIds.size > 0 || null);
  const isFiltered = filteredBookmarkIds.size < allBookmarkIds.size;
  const [tags, setTags] = useState<string>("");
   // Used to track if useEffect was triggered by user de/selecting a bookmark or something else.
   let previouslySelected = useRef<Nullable<Set<string>>>(null);

   useEffect(() => {
     if(!isFiltered && searchFiltered !== null) {
        setSearchFiltered(null);
     }
  }, [filteredBookmarkIds, searchFiltered, setSearchFiltered])
 
  
   useEffect(() => {
      if(
         previouslySelected.current
         && previouslySelected.current.size === 0 
         && selectedBookmarkIds.size > 0
         && searchSelected === null
      ) {
         setSearchSelected(true);
      } else if(selectedBookmarkIds.size === 0 && searchSelected !== null) { 
         setSearchSelected(null);
      }
      previouslySelected.current = selectedBookmarkIds;

   }, [selectedBookmarkIds, searchSelected, setSearchSelected])

   let searchArea =
      searchFiltered === true
         ? filteredBookmarkIds
         : searchFiltered === false
         ? SetOps.difference(allBookmarkIds, filteredBookmarkIds)
         : allBookmarkIds;

   let matchingSelection =
      searchSelected === true
         ? selectedBookmarkIds
         : searchSelected === false
         ? SetOps.difference(allBookmarkIds, selectedBookmarkIds)
         : allBookmarkIds;

   const matchingIds: BookmarkKeys = [...SetOps.intersection(searchArea, matchingSelection)];
   const potentiallyDisastrous = allBookmarkIds.size > 20 && matchingIds.length / allBookmarkIds.size >= .2;
   
   const handleSelect = (status: boolean) => () => dispatch(actionCreators.select(status, matchingIds));
   const handleDelete = () => {
      if(!window.confirm(`Are you sure you want to delete ${matchingIds.length} bookmarks?`)) { 
         return;
      }
      if(potentiallyDisastrous && !window.confirm(`Are you REALLY sure you want to DELETE ${matchingIds.length} of ${allBookmarkIds.size} bookmarks? This is probably IRREVERSIBLE.`)) {
         return;
      }
      // noinspection JSIgnoredPromiseFromCall
      dispatch(actionCreators.remove(matchingIds));
      
   }
   const handleArchive = (status: boolean) => () => dispatch(actionCreators.archive({keys: matchingIds, status}));
   const handleFavorite = (status: boolean) => () => dispatch(actionCreators.favorite({keys: matchingIds, status}));
   const handleTagsChanged = (tags: string[]) => setTags(standardizeTags(tags).join());
   const confirmTagAction = (operation: TagModification) => {
      if(window.confirm(`Are you sure you want to ${TagModification[operation]} these the tags '${tags}' from ${matchingIds.length} bookmarks? This may be irreversible.`)) {
         const payload = ({keys: matchingIds, operation, tags});
         dispatch(actionCreators.modifyTags(payload));
      }
   }
   const handleAddTags = () => confirmTagAction(TagModification.add);
   const handleSetTags = () => confirmTagAction(TagModification.set);
   const handleRemoveTags = () => confirmTagAction(TagModification.remove);   

   return ( 
      <div className={classes.container}>
         
         <div className={classes.spaced}>
            <Typography  variant="h4">Apply To</Typography>
             <div>Filtered ({searchArea.size} / {allBookmarkIds.size})</div>
             <SearchFiltered 
                 value={searchFiltered}
                 setValue={setSearchFiltered} 
                 locked={!isFiltered}
             />

            <div>Selected ({matchingSelection.size} / {allBookmarkIds.size})</div>
            <SearchSelected 
               value={searchSelected}
               setValue={setSearchSelected}
               locked={selectedBookmarkIds.size === 0}
            />
         </div>

         <Divider />


         <div className={classes.spaced}>
            <Typography  variant="h4">Operations</Typography>
            <ButtonGroup className={classes.actionGroup} variant="contained" color="primary" aria-label="contained primary button group">
               <Button onClick={handleSelect(true)} startIcon={<CheckBoxIcon />}>
                  Select
               </Button>
               <Button onClick={handleSelect(false)} startIcon={<CheckBoxOutlineBlankIcon />}>
                  Deselect
               </Button>
            </ButtonGroup>

            <ButtonGroup className={classes.actionGroup} variant="contained" color="primary" aria-label="contained primary button group">
               <Button onClick={handleFavorite(true)} startIcon={<FavoriteIcon/>}>
                  Favorite
               </Button>
               <Button onClick={handleFavorite(false)} startIcon={<FavoriteBorderIcon />}>
                  Unfavorite
               </Button>
            </ButtonGroup>
            
            <ButtonGroup className={classes.actionGroup} variant="contained" color="primary" aria-label="contained primary button group">
               <Button onClick={handleArchive(true)} startIcon={<ArchiveIcon />}>
                  Archive
               </Button>
               <Button onClick={handleArchive(false)} startIcon={<UnarchiveIcon />}>
                  Unarchive
               </Button>
            </ButtonGroup>

            <Button  onClick={handleDelete} color="secondary" variant="contained" startIcon={<DeleteIcon />}>
               Delete
            </Button>
         </div>

         <Divider />
         
         <div className={classes.spaced}>
            <Typography  variant="h4">Tags</Typography>
            <Select
               canAdd={true}
               options={allTagOptions}
               onChangedStrings={handleTagsChanged}
            />
            <ButtonGroup className={classes.actionGroup} variant="contained" color="primary" aria-label="contained primary button group">
               <Button onClick={handleSetTags} startIcon={<SyncIcon />}>
                  Set
               </Button>
               <Button onClick={handleAddTags} disabled={tags.length === 0} startIcon={<AddIcon />}>
                  Add
               </Button>
               <Button onClick={handleRemoveTags} disabled={tags.length === 0} startIcon={<RemoveIcon />}>
                  Remove
               </Button>
            </ButtonGroup>
         </div>
      </div>
   )
};

