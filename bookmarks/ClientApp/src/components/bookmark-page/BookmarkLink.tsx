import React, {Fragment, useState} from "react";
import {Alert, AlertTitle} from "@material-ui/lab";
import {
   Button,
   createStyles,
   Link,
   LinkProps,
   makeStyles,
   Modal,
   Theme,
   Typography,
   withStyles
} from "@material-ui/core";
import {useSelector} from "react-redux";
import {BookmarkDisplayElements, selectors as optionsSelectors} from "../../redux/options/reducer";
import { selectors } from "../../redux/bookmarks/reducer";
import {AppState} from "../../redux/root/reducer";
import {useStoreSelector} from "../../redux/store/configureStore";
import {Title} from "@material-ui/icons";


export type BookmarkLinkProps = LinkProps & {
   bookmarkId: string
}

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      modal: {
         backgroundColor: theme.palette.background.paper, 
         margin: "auto",
         width: "min(50vw, 600px)",
         padding: theme.spacing(4),
      },
      modalWarning: {
         margin: theme.spacing(2), 
      },
      modalContent: {
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         textAlign: "center",
         
         //textAlign: "center",
         "&>*": {
            margin: theme.spacing(3),
         }
      },
      link: {
         
      }
   }));

export const BookmarkLink: React.FC<BookmarkLinkProps> = ({
    bookmarkId, ...rest
}) => {
   const shouldShow = useStoreSelector(optionsSelectors.selectDisplayElementQuery);
   const {trusted} = useStoreSelector(selectors.selectBookmarkSource);
   const showTitle = shouldShow(BookmarkDisplayElements.title);
   const {url, title, excerpt} = useStoreSelector(state => selectors.selectBookmark(state, bookmarkId));
   if(/^javascript/i.test(url)) {
      return (
         <Alert severity="warning">
            <AlertTitle>This link may contain harmful JavaScript code and will be blocked from navigation or excecution.</AlertTitle>
            {url}
         </Alert>
      )
   }
   
   const SourceLink = trusted ? TrustedBookmarkLink : UntrustedBookmarkLink;
   return (
      <SourceLink href={url} title={excerpt} rel="nofollow" target="_blank" {...rest}>
         {showTitle ? title || url : url}
      </SourceLink>
   );
};

/**
 * A link that navigates directly to an external bookmark link.
 * @param children
 * @param rest
 * @constructor
 */
export const TrustedBookmarkLink: React.FC<LinkProps> = ({
   children,
   ...rest
}) => (
   <Link
      rel="nofollow"
      target="_blank"
      {...rest}
   >
      {children}
   </Link> 
);

/**
 * A link that shows a warning and confirmation before navigation.
 * @param children
 * @param rest
 * @constructor
 */
export const UntrustedBookmarkLink: React.FC<LinkProps> = ({
   children,
    ...rest
 }) => {
   /* TODO: Move the modal up to a single parent container and 
         use redux state to store visibility and current link. */
   const [showModal, setShowModel] = useState<boolean>(false);

   const handleClick = (
      e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLSpanElement>
   ) => {
      setShowModel(true);
      e.preventDefault();
      return false;
   }; 

   const classes = useStyles();
   const handleClose = () => setShowModel(false);

   return (
      <div>

         <Modal
            open={showModal}
            onClose={handleClose}
            
            aria-labelledby="link-warn-title"
            aria-describedby="link-warn-description"
         >
            <div className={classes.modal}>
               <Alert className={classes.modalWarning} severity="warning">
                  <AlertTitle id="link-warn-title">Warning</AlertTitle>
                  <Typography id="link-warn-description" component="p" variant="subtitle1">
                     This link comes from an untrusted data source and may be unsafe.
                  </Typography>
               </Alert>

               <div className={classes.modalContent}>
                  <p>
                     <Typography variant="body1">
                        Click this link if you trust it:
                     </Typography>
                     <TrustedBookmarkLink {...rest} onClick={handleClose}>
                        {rest.href}
                     </TrustedBookmarkLink>
                  </p>
                  <div>
                     <Button 
                        size="medium" 
                        color="secondary" 
                        onClick={handleClose}
                     >
                        Click here to cancel
                     </Button>
                  </div>
               </div>
            </div>
         </Modal>
         
         <TrustedBookmarkLink {...rest} onClick={handleClick} >
            {children}
         </TrustedBookmarkLink>
      </div>
   );
};