import React from "react";
import {StoreDispatch} from "../../redux/store/configureStore";
import {AppState} from "../../redux/root/reducer";
import {CapabilityQuery, selectBookmark, selectors} from "../../redux/bookmarks/reducer";
import {
   CreateSelectRequestStateType,
   RequestStateType,
   RequestType,
   selectors as reqStateSelectors,
} from "../../redux/request-states/reducer";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardHeader from "@material-ui/core/CardHeader";
import Favicon from "../images/Favicon";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import FavoriteIcon from "@material-ui/icons/Favorite";
import DeleteIcon from "@material-ui/icons/Delete";
import ArchiveIcon from "@material-ui/icons/Archive";
import {proxyImageSrc} from "../images/proxied-img";
import {actionCreators, ModifyTagsSuccessAction} from "../../redux/bookmarks/actions";
import {TagModification} from "../../api/bookmark-io";
import LoadingFab from "../common/LoadingFab";

import {blue, common, grey, red, yellow} from "@material-ui/core/colors";
import BookmarkTagEditor from "../tags/BookmarkTagEditor";
import {Checkbox, createStyles, FormControlLabel, makeStyles} from "@material-ui/core";
import VirusTotalButton from "../common/VirusTotalButton";
import {BookmarkData} from "../../redux/bookmarks/bookmarks";
import {Theme} from "@material-ui/core/styles";
import {getHostName} from "../../utils";
import {BookmarkDisplayElements, OptionsState, selectors as optionSelectors} from "../../redux/options/reducer";
import {BookmarkLink} from "./BookmarkLink";
import { connect } from "react-redux";
import SelectBookmark from "./SelectBookmark";
import { BookmarkActions } from "./BookmarkActionFab";
import {DomainLabel} from "./DomainLabel";


interface OwnProps {
   bookmarkId: string;
   /** The width of the block for requesting the optimized image size */
   width?: number;
   onLoad?: () => void;
}

const mapDispatchToProps = (dispatch: StoreDispatch, ownProps: OwnProps) => ({
   removeTag: (tag: string): Promise<ModifyTagsSuccessAction> =>
      dispatch(
         actionCreators.modifyTags({
            keys: ownProps.bookmarkId,
            operation: TagModification.remove,
            tags: tag,
         }),
      ),
   addTag: (tag: string): Promise<ModifyTagsSuccessAction> =>
      dispatch(
         actionCreators.modifyTags({
            keys: ownProps.bookmarkId,
            operation: TagModification.add,
            tags: tag,
         }),
      ),
   setTags: (tags: string): Promise<ModifyTagsSuccessAction> =>
      dispatch(
         actionCreators.modifyTags({
            keys: ownProps.bookmarkId,
            operation: TagModification.set,
            tags,
         }),
      )
});

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

// Manually specify these because of the factory.
type StateProps = {
   bookmark: BookmarkData;
   canDo: CapabilityQuery;
   requestStates: CreateSelectRequestStateType;
   shouldShow: (element: BookmarkDisplayElements) => boolean;
};
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createMapStateToProps() {
   const createRequestState = reqStateSelectors.createSelectRequestState();
   return (state: AppState, ownProps: OwnProps): StateProps => ({
      bookmark: selectBookmark(state, ownProps.bookmarkId),
      canDo: selectors.selectCapabilities(state),
      requestStates: createRequestState(state, ownProps),
      shouldShow: optionSelectors.selectDisplayElementQuery(state)
   });
}

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      media: {
         height: 0,
         paddingTop: "56.25%", // 16:9,
         marginTop: "30",
         backgroundSize: "contain",
         backgroundPosition: "center center",
      },
      contents: {
         padding: theme.spacing(1.5),
      }, 
      buttonContainer: {
         justifyContent: "center",
         padding: theme.spacing(1),
      }
   }),
);

export type BookmarkBlockProps = DispatchProps & StateProps & OwnProps & {
   options: OptionsState
};
const BookmarkBlock: React.FC<BookmarkBlockProps> = (props) => {
   const {
      bookmark,
      canDo,
      bookmarkId,
      width,
      requestStates,
      shouldShow
   } = props;
   const { image, url, excerpt } = bookmark;
   const classes = useStyles();
   const proxiedImage = image ? proxyImageSrc(image, width ? { w: width } : {}) : undefined;

   return (
      <Card>
         <CardHeader
            avatar={
               shouldShow(BookmarkDisplayElements.favicon) && (
                  <Favicon
                     faviconUrl={url}
                     proxySource="duckduckgo"
                     alt=""
                     width={24}
                     height={24}
                  />
               )
            }
            title={<BookmarkLink bookmarkId={bookmarkId} />}
            subheader={<DomainLabel url={url}/>}
         />
    
         {shouldShow(BookmarkDisplayElements.image) && proxiedImage && (
            <CardMedia image={proxiedImage} className={`${classes.media}`} />
         )}
    
         <CardContent className={classes.contents}>
            <SelectBookmark bookmarkId={bookmarkId} />

            {shouldShow(BookmarkDisplayElements.description) && (
               <Typography variant="body2" color="textSecondary" component="p">
                  {excerpt}
               </Typography>
            )}

            {shouldShow(BookmarkDisplayElements.tags) && (
               <div>
                  <BookmarkTagEditor bookmarkId={bookmarkId} />
               </div>
            )}
         </CardContent>
         <CardActions className={classes.buttonContainer}>
            <BookmarkActions bookmarkId={bookmarkId} />
         </CardActions>
      </Card>
   );
};

export default connect(
   createMapStateToProps,
   mapDispatchToProps,
)(BookmarkBlock);
