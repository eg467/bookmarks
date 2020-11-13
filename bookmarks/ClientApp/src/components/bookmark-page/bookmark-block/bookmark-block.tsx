import React, { useEffect } from "react";
import { connect } from "react-redux";
import { StoreDispatch } from "../../../redux/store/configureStore";
import { AppState } from "../../../redux/root/reducer";
import { selectBookmark, selectors } from "../../../redux/bookmarks/reducer";
import {
   RequestStateType,
   RequestType,
   selectors as reqStateSelectors,
} from "../../../redux/request-states/reducer";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardHeader from "@material-ui/core/CardHeader";
import { FaviconImg } from "../../images/favicon-img";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import FavoriteIcon from "@material-ui/icons/Favorite";
import DeleteIcon from "@material-ui/icons/Delete";
import ArchiveIcon from "@material-ui/icons/Archive";
import { proxyImageSrc } from "../../images/proxied-img";
import { actionCreators } from "../../../redux/bookmarks/actions";
import { TagModification } from "../../../api/bookmark-io";
import LoadingButton from "../../common/LoadingButton";

import { red, common } from "@material-ui/core/colors";
import BookmarkTagEditor from "../../tags/BookmarkTagEditor";
import { createStyles, makeStyles } from "@material-ui/core";

interface ConnectedProps extends DispatchProps, StateProps, OwnProps {}

interface OwnProps {
   bookmarkId: string;
   /** The width of the block for requesting the optimized image size */
   width?: number;
   onLoad?: () => void;
}

const mapDispatchToProps = (dispatch: StoreDispatch, ownProps: OwnProps) => ({
   archive: (status: boolean): Promise<void> =>
      dispatch(actionCreators.archive(ownProps.bookmarkId, status)),
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
   select: (): void => {
      /* Implement bulk selection/edit feature. */
   },
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createMapStateToProps() {
   const createRequestState = reqStateSelectors.createSelectRequestState();
   return (state: AppState, ownProps: OwnProps): any => ({
      bookmark: selectBookmark(state, ownProps.bookmarkId),
      canDo: selectors.selectCapabilities(state),
      requestStates: createRequestState(state, ownProps),
   });
}
type StateProps = ReturnType<ReturnType<typeof createMapStateToProps>>;

const useStyles = makeStyles(() =>
   createStyles({
      media: {
         height: 0,
         paddingTop: "56.25%", // 16:9,
         marginTop: "30",
         backgroundSize: "contain",
         backgroundPosition: "center center",
      },
   }),
);

const BookmarkBlock: React.FC<ConnectedProps> = (props) => {
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
   } = props;

   const classes = useStyles();

   const { image, tags, title, url, excerpt, archive, favorite } = bookmark;
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

   useEffect(() => {
      // call loaded if the main image wasn't set

      console.log("bookmark block useeffect");

      if (!image) {
         handleLoad();
      }
   }, [image, onLoad]);

   const domain = getHostName(url);
   const showFavicon = false;
   const showMainImage = false;

   const buttonSize = 38;

   const FavoriteButton = (): JSX.Element => (
      <LoadingButton
         state={getReqStatus(RequestType.favorite)}
         aria-label={favorite ? "Unfavorite bookmark" : "Favorite bookmark"}
         onClick={() => setFavorite(!favorite)}
         foregroundColor={favorite ? red[800] : common.black}
         diameter={buttonSize}
      >
         <FavoriteIcon />
      </LoadingButton>
   );

   const ArchiveButton = (): JSX.Element => (
      <LoadingButton
         state={getReqStatus(RequestType.archive)}
         aria-label={archive ? "Unarchive bookmark" : "Archive bookmark"}
         onClick={(): Promise<void> => setArchived(!archive)}
         diameter={buttonSize}
      >
         <ArchiveIcon />
      </LoadingButton>
   );

   const DeleteButton = (): JSX.Element => (
      <LoadingButton
         state={getReqStatus(RequestType.remove)}
         aria-label="Remove bookmark"
         onClick={(): void => {
            if (window.confirm("Are you sure?")) {
               // noinspection JSIgnoredPromiseFromCall
               remove();
            }
         }}
         diameter={buttonSize}
      >
         <DeleteIcon />
      </LoadingButton>
   );



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

         <CardContent style={{ overflowY: "auto" }}>
            {excerpt && (
               <Typography variant="body2" color="textSecondary" component="p">
                  {excerpt}
               </Typography>
            )}

            <div>
               <BookmarkTagEditor values={tags} bookmarkId={bookmarkId} />
            </div>
         </CardContent>
         <CardActions>
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
