import React from "react";
import {
   createStyles,
   Link,
   List,
   ListItem,
   ListItemIcon,
   ListItemText,
   ListSubheader, makeStyles, Theme
} from "@material-ui/core";
import AppleIcon from "@material-ui/icons/Apple";
import AndroidIcon from "@material-ui/icons/Android";
import ExtensionIcon from '@material-ui/icons/Extension';
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";
import {actionCreators as bmActionCreators } from "../../redux/pocket/actions";
import { Alert, AlertTitle } from "@material-ui/lab";
import {ImportPanelChildProps, makeImportForm, useSubmitHandlerCreator} from "./ActionPanel";
import PocketAuthButton from "../pocket-auth/PocketAuthButton";
import {SourcedBookmarks} from "../../redux/bookmarks/reducer";
import {PocketAuth} from "../pocket-auth/PocketAuth";

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      auth: {
         margin: theme.spacing(2)
      }
   }));

export type PocketImporterProps = ImportPanelChildProps & { };
const PocketImporter: React.FC<PocketImporterProps> = ({setHandler}) => {
   const {username,awaitingAuthorization,authError} = useStoreSelector(state => state.pocket);
   const classes = useStyles();
   const dispatch = useStoreDispatch();
   
   useSubmitHandlerCreator(
      !!username,
      setHandler,
      () => 
         dispatch(bmActionCreators.fetchBookmarks()).then(r => {
            if (!r.response) {
               throw Error("No response was received from Pocket.");
            }
            return r.response as SourcedBookmarks;
         }),
      [dispatch]
   );
   
   return (
      <div>
         <PocketAuth className={classes.auth} />
         <p>
            <a href="https://getpocket.com" target="_blank">GetPocket.com</a> is an online bookmark-saving service.
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
        
            
      </div>
   );
};

export const PocketImporterForm = makeImportForm(PocketImporter, "Import from Pocket");
export default PocketImporterForm;
