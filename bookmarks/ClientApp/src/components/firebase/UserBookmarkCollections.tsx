import * as React from 'react';
import {useFirebaseDb} from "../../api/firebase/firebase";
import {
   List,
   Typography,
   ListItem,
   ListItemText,
   Divider,
   TextField,
   FormControlLabel,
   Checkbox,
   makeStyles,
   Theme,
   createStyles,
   Button,
   Fade, Card, CardContent, CardActions, IconButton, CardHeader, ListItemSecondaryAction
} from "@material-ui/core";
import {useState, useEffect, useRef} from "react";
import {ciIndexOf} from "../../redux/bookmarks/reducer";
import {Alert} from "@material-ui/lab";
import clsx from "clsx";
import {blue, common, grey, lightGreen} from "@material-ui/core/colors";
import PublicIcon from '@material-ui/icons/Public';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
const useOwnedBookmarkSetCardStyles = makeStyles((theme: Theme) =>
   createStyles({
      root: {
         width: 300,
         margin: theme.spacing(2), 
         display: "inline-block",
      },
      cardContents: {
         textAlign: "center",
         padding: 8,
      },
      publicLink: {
         color: blue[600],
      },
      PrivateLink: {
         color: grey[400],
      }
   }));


export type OwnedBookmarkSetCardProps = {
   setId: string;
   onSelect: (setId: string) => void;
};
export const OwnedBookmarkSetCard: React.FC<OwnedBookmarkSetCardProps> = ({
   setId,
   onSelect,
}) => {
   const {userData, togglePublic, deleteBookmarkSet, favoriteBookmarkEntry} = useFirebaseDb();
   const classes = useOwnedBookmarkSetCardStyles();
   if(!userData) {
      return null;
   }
   
   const {title, public: isPublic} = userData.owned[setId];
   const isFavorite = !!userData.favorites[setId];
    
   const handleDelete = async () => {
      if(!window.confirm("Are you sure you want to delete this bookmark set. This will be permanent.")) {
         return;
      }
      await deleteBookmarkSet(setId);
   }

   const handleTogglePublic = () => togglePublic(setId, !isPublic);
   
   const publicToggleClassname = clsx(isPublic ? classes.publicLink : classes.PrivateLink)
   const ToggleFavIcon = isFavorite ? FavoriteIcon : FavoriteBorderIcon;
   
   return (
      <Card className={classes.root}>
         
         <CardHeader 
            
            title={title}
            subheader={isPublic ? "public" : "private"} 
            onClick={() => onSelect(setId)}
         />
         <CardContent>
            Preview Link will go here
         </CardContent>
         <CardActions>
            <IconButton onClick={() => favoriteBookmarkEntry(setId, !isFavorite)}>
               <ToggleFavIcon />
            </IconButton>
            <IconButton className={publicToggleClassname} onClick={handleTogglePublic}>
               <PublicIcon />
            </IconButton>
            <IconButton onClick={handleDelete}>
               <DeleteForeverIcon />
            </IconButton>
         </CardActions>
      </Card>
   );
};

export type UserBookmarkCollectionsProps = {
   onSelect: (id: string) => void;
   highlightedId?: string;
};

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      highlight: {
         backgroundColor: lightGreen[50],
      },
      unhighlight: {
         transition: "background-color 1s",         
      },
      noBookmarkSet: {
         color: grey[400],
         padding: theme.spacing(2),
      },
      bookmarkSets: {
         backgroundColor: grey[200],
         color: theme.palette.getContrastText(grey[200]),
         margin: theme.spacing(2),
         padding: theme.spacing(2),
      },
      form: {
         display: "flex",
         flexDirection: "column",
         "& > *": {
            margin: theme.spacing(1),
         },
         "&  input[type=text]": {
            backgroundColor: common.white,
         }
      },
   }));

export const UserBookmarkCollections: React.FC<UserBookmarkCollectionsProps> = ({
   onSelect,
   highlightedId,
}) => {
   const {favoriteBookmarkEntry, userData} = useFirebaseDb();
   const classes = useStyles();
   const [currentHighlight, setCurrentHighlight] = useState(highlightedId);
   
   useEffect(() => {
      if(!highlightedId) {
         return;
      }
      
      setCurrentHighlight(highlightedId);
      const flashDuration = 2000;
      let timeoutId = setTimeout(() => setCurrentHighlight(""), flashDuration);
      return () => clearTimeout(timeoutId);
   }, [highlightedId]);
   
   if(!userData) {
      return <div>No user bookmarks are available. Are you logged in?</div>
   }
   
   const {favorites, owned} = userData;
   const handleSelection = (id: string) => {
      if(onSelect) {
         onSelect(id);
      }
   };

   
   const favoriteKeys = Object.keys(favorites);
   const favoriteBookmarks = favoriteKeys.length 
      ? (
         <List dense>
            {favoriteKeys.reverse().map(k => (
               <ListItem 
                  button 
                  key={k}
                  className={clsx(k === currentHighlight ? classes.highlight : classes.unhighlight)}
                  aria-label="load bookmark"
               >
                  <ListItemText  primary={favorites[k]} onClick={() => handleSelection(k)} />
                  <ListItemSecondaryAction>
                     <IconButton
                        edge="end"
                        aria-label="remove from favorites"
                        onClick={() => favoriteBookmarkEntry(k, false)}
                     >
                        <CloseIcon />
                     </IconButton>
                  </ListItemSecondaryAction>
               </ListItem>
            ))}
         </List>
      )
      : (
         <div className={classes.noBookmarkSet}>You have no favorite bookmark sets.</div>
      );
   
   const ownedKeys = Object.keys(owned);
   const ownedItems = ownedKeys.length 
      ? ownedKeys.reverse().map(k => <OwnedBookmarkSetCard key={k} setId={k} onSelect={onSelect} />)
      : (
         <div className={classes.noBookmarkSet}>You have not saved any bookmarks.</div>
      );
   
   return (
      <div>
         
         <div className={classes.bookmarkSets}>
            <Typography variant="h5" >Favorites</Typography>
            {favoriteBookmarks}   
         </div>
         <div className={classes.bookmarkSets}>
            <Typography variant="h5" >Owned</Typography>
            {ownedItems}
         </div>
         <div className={classes.bookmarkSets}>
            <Typography variant="h5" >Custom</Typography>
            <SelectBookmarkCollection selected={handleSelection} />   
         </div>
      </div>
   );
};

export default UserBookmarkCollections;


export type CreateBookmarkCollectionProps = {
   created?: (id: string) => void;
   unavailableValues: string[];
};
export const CreateBookmarkCollection: React.FC<CreateBookmarkCollectionProps> = ({
   created,
   unavailableValues,
}) => {
   const classes = useStyles();
   const [title, setTitle] = useState("");
   const [error, setError] = useState("");
   const [isPublic, setIsPublic] = useState(false);
   const [createdTitle, setCreatedTitle] = useState("");
   const loading = useRef(false);
   const {createBookmarkSet} = useFirebaseDb();
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(!title) {
         return;
      }
      loading.current = true;
      try {
         const key = await createBookmarkSet(title,isPublic);
         if(created) {
            created(key);
            setCreatedTitle(title);
            setTitle("");
         }      
      } catch(e) {
         setCreatedTitle("");
         console.error(e);
         setError(String(e));
      } finally {
         loading.current = true;
         
         
      }
   };
   
   const titleTaken = ciIndexOf(title, unavailableValues) >= 0; 
   
   return (
      <form
         
         className={clsx(classes.form, classes.bookmarkSets)}
         onSubmit={handleSubmit}
      >

         <Fade unmountOnExit in={!!createdTitle}  timeout={{ enter: 300, exit: 1000 }}>
            <Alert severity="success">
               Bookmark set created: <b>{createdTitle}</b>
            </Alert>
         </Fade>
         
         {error && <Alert severity="error">{error}</Alert>}
         <TextField 
            required
            variant="outlined"
            label="Collection Name"
            value={title}
            onChange={e => setTitle(e.target.value)}
         />
         {titleTaken && !loading.current && (
            <Alert severity="warning">That title already exists.</Alert>
         )}
         <FormControlLabel
            label="Publicly accessible"
            control={<Checkbox value={isPublic} onChange={e => setIsPublic(e.target.checked)} />}
         />
         <Button
            variant="contained"
            color="primary"
            disabled={loading.current || !title || titleTaken}
            type="submit"
         >
            Create
         </Button>
      </form>
   );
}; 
 
export type SelectBookmarkCollectionProps = {
   selected?: (id: string) => void;
   error?: string;
};
export const SelectBookmarkCollection: React.FC<SelectBookmarkCollectionProps> = ({
   selected,
   error,
}) => {
   const classes = useStyles();
   const [id, setId] = useState("");
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(selected) {
         selected(id);
      }
   };

   return (
      <form
         className={classes.form}
         onSubmit={handleSubmit}
      >
         <Typography variant="h5">Load another existing collection</Typography>
         {error && <Alert severity="error">{error}</Alert>}
         <TextField
            required
            label="Collection ID"
            variant="outlined"
            value={id}
            onChange={e => setId(e.target.value)}
         />
         <Button
            variant="contained"
            color="primary"
            disabled={!!id} type="submit"
         >
            Select
         </Button>
      </form>
   );
};