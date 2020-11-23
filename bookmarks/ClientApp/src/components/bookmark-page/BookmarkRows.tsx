import * as React from 'react';
import {selectors} from "../../redux/bookmarks/reducer";
import {BookmarkDisplayElements, selectors as optionsSelector} from "../../redux/options/reducer";
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";
import SelectBookmark from "./SelectBookmark";
import {BookmarkFavicon} from "../images/Favicon";
import {BookmarkLink} from "./BookmarkLink";
import {BookmarkActions} from "./BookmarkActionFab";
import {createStyles, makeStyles} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles";
import BookmarkTagEditor from "../tags/BookmarkTagEditor";

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      media: {
         height: 0,
         paddingTop: "56.25%", // 16:9,
         marginTop: "30",
         backgroundSize: "contain",
         backgroundPosition: "center center",
      },
      actionContainer: {
         display: "flex",
         "&>*": {
            margin: theme.spacing(1)
         }
      },
      favicon: {
         display: "block"
      }
   }),
);


export type BookmarkRowsProps = {
   bookmarkId: string;
}
export const BookmarkRow: React.FC<BookmarkRowsProps> = ({
   bookmarkId
}) => {
   const {id, url, title, image, tags, excerpt} = useStoreSelector(state => selectors.selectBookmark(state, bookmarkId));
   const shouldShow = useStoreSelector(optionsSelector.selectDisplayElementQuery);
   const classes = useStyles();
   const dispatch = useStoreDispatch();
   return (
      <tr style={{verticalAlign: "middle"}}>
         <td>
            <SelectBookmark bookmarkId={id} />
         </td>
         
         {shouldShow(BookmarkDisplayElements.favicon) &&
            <td>
                <BookmarkFavicon className={classes.favicon} faviconUrl={url} />
            </td>
         }

         <td>
             <BookmarkLink bookmarkId={id}/>
         </td>
         
         {shouldShow(BookmarkDisplayElements.tags) && (
            <td>
               <BookmarkTagEditor bookmarkId={bookmarkId} />
            </td>
         )}

         {shouldShow(BookmarkDisplayElements.edit) && 
            <td className={classes.actionContainer}>
               <BookmarkActions bookmarkId={bookmarkId} />   
            </td>
         }
      </tr>
   );
};

export const BookmarkRows = () => {
   
   const ids = useStoreSelector(selectors.selectSortedBookmarkIds);
   const rows = ids.map(id => <BookmarkRow key={id} bookmarkId={id} />);
   
   return (
     <table>
        <tbody>
         {rows}
        </tbody>
     </table> 
   );
};
   