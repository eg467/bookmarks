import React from "react";
import {
   Button,
   ButtonProps,
   CircularProgress,
   Link,
   List,
   ListItem,
   ListItemIcon,
   ListItemText,
   ListSubheader
} from "@material-ui/core";
import AppleIcon from "@material-ui/icons/Apple";
import AndroidIcon from "@material-ui/icons/Android";
import ExtensionIcon from '@material-ui/icons/Extension';
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";
import {actionCreators as bmActionCreators } from "../../redux/pocket/actions";
import { Alert, AlertTitle } from "@material-ui/lab";
import { BookmarkImporterCard } from "./Importers";
import PocketAuthButton from "../pocket-auth/PocketAuthButton";

const PocketImporter = (): JSX.Element => {
   const {username,awaitingAuthorization,authError} = useStoreSelector(state => state.pocket);
   const dispatch = useStoreDispatch();
   const loadBookmarkHandler = username 
      ? () => dispatch(bmActionCreators.fetchBookmarks())
      : undefined;

   const LoginButton = <PocketAuthButton username={username} loading={awaitingAuthorization} />
   return (
      <BookmarkImporterCard 
         header="Pocket Account"
         additionalActions={LoginButton} 
         onImportBookmarks={loadBookmarkHandler}
      >
         {username &&
            <Alert severity="success">You are logged in as <b>{username}</b>.</Alert>
         }

         {authError &&
            <Alert severity="error">
                <AlertTitle>Authentication Error</AlertTitle>
               {authError}
            </Alert>
         }
         
         <p>
            <a href="https://getpocket.com">GetPocket.com</a> is an online bookmark-saving service.
         </p>
         <List
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
               <ListSubheader component="div" id="nested-list-subheader">
                  Pocket Apps and Extensions
               </ListSubheader>
            }
         >
            <ListItem>
               <ListItemIcon>
                  <AppleIcon />
               </ListItemIcon>
               <Link target="_blank" href="https://apps.apple.com/us/app/pocket-save-read-grow/id309601447">
                  <ListItemText primary="Apple AppStore" />
               </Link>
            </ListItem>
            <ListItem>
               <ListItemIcon>
                  <AndroidIcon />
               </ListItemIcon>
               <Link target="_blank" href="https://play.google.com/store/apps/details?id=com.ideashower.readitlater.pro&hl=en_US&gl=US">
                  <ListItemText primary="Google Play Store" />
               </Link>
            </ListItem>
            <ListItem>
               <ListItemIcon>
                  <ExtensionIcon />
               </ListItemIcon>
               <Link target="_blank" href="https://support.mozilla.org/en-US/kb/what-pocket">
                  <ListItemText primary="Firefox" secondary="Built in by default" />
               </Link>
            </ListItem>
            <ListItem>
               <ListItemIcon>
                  <ExtensionIcon />
               </ListItemIcon>
               <Link target="_blank" href="https://chrome.google.com/webstore/detail/save-to-pocket/niloccemoadcdkdjlinkgdfekeahmflj">
                  <ListItemText primary="Chrome" />
               </Link>
            </ListItem>
         </List>
      </BookmarkImporterCard>
   );
};
export default PocketImporter;


