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


export type BookmarkDescriptionProps = LinkProps & {
   bookmarkId: string
}

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
   }));

export const BookmarkDescription: React.FC<BookmarkDescriptionProps> = ({
   bookmarkId, ...rest
}) => {
   const description = useStoreSelector(s => selectors.selectBookmark(s, bookmarkId).excerpt);
   return <div>{description}</div>;
};

export default BookmarkDescription;