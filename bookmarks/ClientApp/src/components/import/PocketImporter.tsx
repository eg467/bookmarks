import {useSelector} from "react-redux";
import {AppState} from "../../redux/root/reducer";
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
   ListSubheader,
   Typography
} from "@material-ui/core";
import AppleIcon from "@material-ui/icons/Apple";
import AndroidIcon from "@material-ui/icons/Android";
import ExtensionIcon from '@material-ui/icons/Extension';
import {useStoreDispatch} from "../../redux/store/configureStore";
import {actionCreators as authActionCreators} from "../../redux/pocket/auth/actions";
import {actionCreators as bmActionCreators } from "../../redux/pocket/bookmarks/actions";
import { Alert, AlertTitle } from "@material-ui/lab";
import { BookmarkImporterCard } from "./Importers";

export type PocketAuthButtonProps = ButtonProps & {
   username: string;
   loading: boolean;
}
export const PocketAuthButton: React.FC<PocketAuthButtonProps> = ({
   username, 
   loading,
   ...rest
}) => {
   const dispatch = useStoreDispatch();
   const login = () => dispatch(authActionCreators.login());
   const logout = () => dispatch(authActionCreators.logout());
   
   if(loading) {
     return <CircularProgress />; 
   } else if(username) {
      return (
         <Button size="large" variant="contained" color="default" {...rest} onClick={logout}>
            Logout
         </Button>
      ) 
   } else {
      return (
         <Button variant="contained" color="primary" size="large" {...rest} onClick={login}>
            Login or Create an Account
         </Button>
      );
   }
}


const PocketImporter = (): JSX.Element => {
   const {username,error,loading} = useSelector((state: AppState) => state.pocket.auth);
   const dispatch = useStoreDispatch();
   const loadBookmarkHandler = username 
      ? () => dispatch(bmActionCreators.fetchBookmarks())
      : undefined;

   const LoginButton = <PocketAuthButton username={username} loading={loading} />
   return (
      <BookmarkImporterCard 
         header="Pocket Account"
         additionalActions={LoginButton} 
         onImportBookmarks={loadBookmarkHandler}
      >
         {username &&
            <Alert severity="success">You are logged in as <b>{username}</b>.</Alert>
         }

         {error &&
            <Alert severity="error">
                <AlertTitle>Authentication Error</AlertTitle>
               {error}
            </Alert>
         }
         
         <Typography variant="body2" color="textSecondary" component="p">
            <Link href="https://getpocket.com">GetPocket.com</Link> is an online bookmark-saving service.
         </Typography>
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
                  <ListItemText primary="Firefox" secondary="Built into firefox by default" />
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


