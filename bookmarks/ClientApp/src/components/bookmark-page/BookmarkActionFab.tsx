import Fab, {FabProps} from "@material-ui/core/Fab";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {RequestStateType, RequestType, selectors as reqSelectors, readRequestState, RequestState} from "../../redux/request-states/reducer";
import {selectors as bmSelectors} from "../../redux/bookmarks/reducer";
import React, { Fragment } from "react";
import {colors} from "@material-ui/core";
import {blue, common, grey, red} from "@material-ui/core/colors";
import LoadingFab from "../common/LoadingFab";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ArchiveIcon from "@material-ui/icons/Archive";
import DeleteIcon from "@material-ui/icons/Delete";
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";
import {
   actionCreators,
   ArchiveBookmarkSuccessAction,
   FavoriteBookmarkSuccessAction,
   RemoveBookmarkSuccessAction
} from "../../redux/bookmarks/actions";
import VirusTotalButton from "../common/VirusTotalButton";

export type BookmarkActionFabStyleProps = {
    diameter?: number;
    backgroundColor?: string;
    foregroundColor?: string;
};

export type BookmarkActionFabProps = FabProps & BookmarkActionFabStyleProps;

export const useBookmarkActionFabStyles = makeStyles((_: Theme) =>
    createStyles({
        fab: ({ diameter, foregroundColor, backgroundColor }: BookmarkActionFabStyleProps) => ({
            width: diameter,
            height: diameter,
            color: foregroundColor,
            backgroundColor
        }),

    })); 

export const BookmarkActionFab: React.FC<BookmarkActionFabProps> = (props) => {
    const {
        diameter = 36,
        backgroundColor = colors.common.white,
        foregroundColor = blue[500],
        children,
        ...rest
    } = props;
    const classes = useBookmarkActionFabStyles({diameter,foregroundColor,backgroundColor});
    return <Fab {...rest} className={classes.fab}>{children}</Fab>;
};

export const BookmarkActions: React.FC<{bookmarkId: string}> = ({bookmarkId}) => {
    //requestStates: createRequestState(state, ownProps),
    
    const dispatch = useStoreDispatch();

   const {archive, url, favorite} = useStoreSelector(state => bmSelectors.selectBookmark(state, bookmarkId));
   const canDo = useStoreSelector(bmSelectors.selectCapabilities);
    const requestStates = useStoreSelector(
       state => reqSelectors.selectRequestStatesForBookmark(state, {bookmarkId}));
    const getReqState = (reqType: RequestType): RequestState => 
       readRequestState(requestStates, reqType);

   const getReqStatus = (reqType: RequestType): RequestStateType => getReqState(reqType).state;

   const setArchived = (status: boolean): Promise<ArchiveBookmarkSuccessAction> =>
      dispatch(actionCreators.archive({ keys: bookmarkId, status }));
   
   const remove = (): Promise<RemoveBookmarkSuccessAction> => 
      dispatch(actionCreators.remove(bookmarkId));

   const setFavorite = (status: boolean): Promise<FavoriteBookmarkSuccessAction> =>
      dispatch(actionCreators.favorite({ keys: bookmarkId, status }));
      
    const FavoriteButton = (): JSX.Element => (
       <LoadingFab
          state={getReqStatus(RequestType.favorite)}
          aria-label={favorite ? "Unfavorite bookmark" : "Favorite bookmark"}
          onClick={() => setFavorite(!favorite)}
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
          foregroundColor={archive ? blue[600] : grey[600]}
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
          foregroundColor={common.white}
          backgroundColor={red[800]}
       >
           <DeleteIcon />
       </LoadingFab>
    );
    
    
    return (
       <Fragment>
          <VirusTotalButton url={url} />
          {canDo("favorite") && FavoriteButton()}
          {canDo("archive") && ArchiveButton()}
          {canDo("remove") && DeleteButton()}
       </Fragment>
    );

};