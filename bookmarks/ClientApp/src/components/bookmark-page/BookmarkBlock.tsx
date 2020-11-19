import React, {useEffect, useState} from "react";
import { connect } from "react-redux";
import { StoreDispatch } from "../../redux/store/configureStore";
import { AppState } from "../../redux/root/reducer";
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
import { FaviconImg } from "../images/favicon-img";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import FavoriteIcon from "@material-ui/icons/Favorite";
import DeleteIcon from "@material-ui/icons/Delete";
import ArchiveIcon from "@material-ui/icons/Archive";
import { proxyImageSrc } from "../images/proxied-img";
import {actionCreators, BookmarkToggleActionPayload} from "../../redux/bookmarks/actions";
import { TagModification } from "../../api/bookmark-io";
import LoadingFab from "../common/LoadingFab";

import { red, common } from "@material-ui/core/colors";
import BookmarkTagEditor from "../tags/BookmarkTagEditor";
import {Checkbox, createStyles, makeStyles, FormControlLabel} from "@material-ui/core";
import VirusTotalButton from "../common/VirusTotalButton";
import {BookmarkData} from "../../redux/bookmarks/bookmarks";
import {CheckBox} from "@material-ui/icons";
import {Theme} from "@material-ui/core/styles";



interface OwnProps {
   bookmarkId: string;
   /** The width of the block for requesting the optimized image size */
   width?: number;
   onLoad?: () => void;
}

const mapDispatchToProps = (dispatch: StoreDispatch, ownProps: OwnProps) => ({
   archive: (status: boolean): Promise<void> =>
      dispatch(actionCreators.archive({ keys: ownProps.bookmarkId, status })),
   remove: (): Promise<void> =>
      dispatch(actionCreators.remove(ownProps.bookmarkId)),
   favorite: (status: boolean): Promise<void> =>
      dispatch(actionCreators.favorite({ keys: ownProps.bookmarkId, status })),
   removeTag: (tag: string): Promise<void> =>
      dispatch(
         actionCreators.modifyTags({
            keys: ownProps.bookmarkId,
            operation: TagModification.remove,
            tags: tag,
         }),
      ),
   addTag: (tag: string): Promise<void> =>
      dispatch(
         actionCreators.modifyTags({
            keys: ownProps.bookmarkId,
            operation: TagModification.add,
            tags: tag,
         }),
      ),
   setTags: (tags: string): Promise<void> =>
      dispatch(
         actionCreators.modifyTags({
            keys: ownProps.bookmarkId,
            operation: TagModification.set,
            tags,
         }),
      ),
   select: (selected: boolean): void => {
      dispatch(actionCreators.select(selected, ownProps.bookmarkId))
   },
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

// Manually specify these because of the factory.
type StateProps = {
   bookmark: BookmarkData;
   canDo: CapabilityQuery;
   requestStates: CreateSelectRequestStateType;
   selected: boolean;
};
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createMapStateToProps() {
   const createRequestState = reqStateSelectors.createSelectRequestState();
   return (state: AppState, ownProps: OwnProps): StateProps => ({
      bookmark: selectBookmark(state, ownProps.bookmarkId),
      canDo: selectors.selectCapabilities(state),
      requestStates: createRequestState(state, ownProps),
      selected: selectors.selectBookmarkSelection(state, ownProps.bookmarkId)
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

export type BookmarkBlockProps = DispatchProps & StateProps & OwnProps & {};
const BookmarkBlock: React.FC<BookmarkBlockProps> = (props) => {
   const {
      archive: setArchived,
      remove,
      favorite: setFavorite,
      bookmark,
      canDo,
      onLoad,
      bookmarkId,
      width,
      requestStates,
      select,
      selected
   } = props;
    const { image, tags, title, url, excerpt, archive, favorite } = bookmark;
   const classes = useStyles();
  
   const getReqStatus = (reqType: RequestType): RequestStateType =>
      requestStates.reqStatus(reqType).state;
   const proxiedImage = image
      ? proxyImageSrc(image, width ? { w: width } : {})
      : undefined;

   function getHostName(url: string): string | null {
      if (!url) {
         return null;
      }
      const a = document.createElement("a");
      a.href = url;
      return a.host;
   }

   function handleLoad(): void {
      if (onLoad) {
         onLoad();
      }
   }

   function handleError(e: React.SyntheticEvent<HTMLDivElement, Event>): void {
      (e.target as HTMLDivElement).style.display = "none";
      handleLoad();
   }
   
   const [test, setTest] = useState(false);

   useEffect(() => {
      // call loaded if the main image wasn't set
      if (!image) {
         handleLoad();
      }
   }, [image, onLoad, handleLoad]);

   const domain = getHostName(url);
   const showFavicon = false;
   const showMainImage = false;
   const FavoriteButton = (): JSX.Element => (
      <LoadingFab
         state={getReqStatus(RequestType.favorite)}
         aria-label={favorite ? "Unfavorite bookmark" : "Favorite bookmark"}
         onClick={() => {
            console.log("favorite", favorite)
            setFavorite(!favorite);
         }}
         foregroundColor={favorite ? red[800] : common.black}
      >
         <FavoriteIcon />
      </LoadingFab>
   );

   const ArchiveButton = (): JSX.Element => (
      <LoadingFab
         state={getReqStatus(RequestType.archive)}
         aria-label={archive ? "Unarchive bookmark" : "Archive bookmark"}
         onClick={() => setArchived(!archive)}
      >
         <ArchiveIcon />
      </LoadingFab>
   );

   const DeleteButton = (): JSX.Element => (
      <LoadingFab
         state={getReqStatus(RequestType.remove)}
         aria-label="Remove bookmark"
         onClick={(): void => {
            if (window.confirm("Are you sure?")) {
               // noinspection JSIgnoredPromiseFromCall
               remove();
            }
         }}
      >
         <DeleteIcon />
      </LoadingFab>
   );

   const handleSelection = (event: React.ChangeEvent<HTMLInputElement>) => 
      select(event.target.checked);

   return (
      <Card>
         <CardHeader
            avatar={
               showFavicon && (
                  <FaviconImg
                     url={url}
                     source="duckduckgo"
                     alt=""
                     width={24}
                     height={24}
                  />
               )
            }
            title={title}
            subheader={domain}
         />
    
         {(showMainImage && proxiedImage && (
            <CardMedia
               onLoad={handleLoad}
               onError={handleError}
               image={proxiedImage}
               className={`${classes.media}`}
            />
         )) ||
            null}

    
         <CardContent className={classes.contents}>
            <FormControlLabel
               control={<Checkbox checked={selected} onChange={handleSelection} />}
               label="Selected"
            />

            {excerpt && (
               <Typography variant="body2" color="textSecondary" component="p">
                  {excerpt}
               </Typography>
            )}

            <div>
               <BookmarkTagEditor values={tags} bookmarkId={bookmarkId} />
            </div>
         </CardContent>
         <CardActions className={classes.buttonContainer}>
            <VirusTotalButton url={url} />
            {canDo("favorite") && FavoriteButton()}
            {canDo("archive") && ArchiveButton()}
            {canDo("remove") && DeleteButton()}
         </CardActions>
      </Card>
   );
};

export default connect(
   createMapStateToProps,
   mapDispatchToProps,
)(BookmarkBlock);
