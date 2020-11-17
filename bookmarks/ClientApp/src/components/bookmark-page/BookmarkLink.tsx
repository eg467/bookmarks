import React, { Fragment, useState } from "react";
import { AlertTitle, Alert } from "@material-ui/lab";
import {Link, Modal, Typography, Button, LinkProps} from "@material-ui/core";


export type BookmarkLinkProps = LinkProps & {
   url: string;
   label: string;
}

export const BookmarkLink: React.FC<BookmarkLinkProps> = ({
   url,
   label,
   ...rest
}) => {
   if(url.toUpperCase().startsWith("JAVASCRIPT")) {
      return (
         <Alert severity="warning">
            <AlertTitle>This link may contain harmful JavaScript code.</AlertTitle>
            {url}
         </Alert>
      )
   }

   return (
      <Link
         href={url}
         rel="nofollow"
         target="_blank"
         {...rest}
      >
         {label || url}
      </Link>
   );
};

export const UntrustedBookmarkLink: React.FC<BookmarkLinkProps> = ({
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
      return false;
   };

   const handleClose = () => setShowModel(false);

   return (
      <Fragment>

         <Modal
            open={showModal}
            onClose={handleClose}
            aria-labelledby="link-warn-title"
            aria-describedby="link-warn-description"
         >
            <Fragment>
               <Alert severity="warning">
                  <AlertTitle id="link-warn-title">Warning</AlertTitle>
                  <Typography id="link-warn-description" component="p" variant="subtitle1">
                     This link comes from an untrusted data source and may be unsafe.
                  </Typography>
               </Alert>

               <Typography variant="body1" component="p">
                  Click this link if you trust it:
               </Typography>
               <BookmarkLink {...rest} onClick={handleClose}>
                  {rest.href}
               </BookmarkLink>
               <div>
                  <Button 
                     size="medium" 
                     color="secondary" 
                     onClick={handleClose}
                  >
                     Click here to cancel
                  </Button>
               </div>
            </Fragment>
         </Modal>
         
         <BookmarkLink {...rest} onClick={handleClick} >
            {children}
         </BookmarkLink>
      </Fragment>
   );
};