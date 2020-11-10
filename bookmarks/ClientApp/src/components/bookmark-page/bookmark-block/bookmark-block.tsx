import React, { useEffect, memo } from 'react';
import { connect } from "react-redux";
import { StoreDispatch } from "../../../redux/store/configureStore";
import { AppState } from "../../../redux/root/reducer";
import { selectBookmark, selectors } from "../../../redux/bookmarks/reducer";
import { RequestType, selectors as reqStateSelectors } from "../../../redux/request-states/reducer";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardHeader from "@material-ui/core/CardHeader";
import { FaviconImg } from "../../images/favicon-img";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import FavoriteIcon from '@material-ui/icons/Favorite';
import DeleteIcon from '@material-ui/icons/Delete';
import ArchiveIcon from '@material-ui/icons/Archive';
import Chip from "@material-ui/core/Chip";
import { proxyImageSrc } from '../../images/proxied-img';
import { actionCreators } from '../../../redux/bookmarks/actions';
import { BookmarkKeys, TagModification } from '../../../api/bookmark-io';
import LoadingButton from '../../common/LoadingButton';
import { red, common } from '@material-ui/core/colors';

interface ConnectedProps extends DispatchProps, StateProps, OwnProps {
}

interface OwnProps {
    id: string;
    /** The width of the block for requesting the optimized image size */
    width?: number;
    onLoad?: () => void;
}

const mapDispatchToProps = (dispatch: StoreDispatch, ownProps: OwnProps) => ({
    archive: (status: boolean) => dispatch(actionCreators.archive(ownProps.id, status)),
    remove: () => dispatch(actionCreators.remove(ownProps.id)),
    favorite: (status: boolean) => dispatch(actionCreators.favorite({ keys: ownProps.id, status })),
    removeTag: (tag: string) => dispatch(actionCreators.modifyTags({ keys: ownProps.id, operation: TagModification.remove, tags: tag })),
    addTag: (tag: string) => dispatch(actionCreators.modifyTags({ keys: ownProps.id, operation: TagModification.add, tags: tag })),
    setTags: (tags: string) => dispatch(actionCreators.modifyTags({ keys: ownProps.id, operation: TagModification.set, tags })),
    select: () => { /* Implement bulk selection/edit feature. */ }
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

function createMapStateToProps() {
    const createRequestState = reqStateSelectors.createSelectRequestState();
    return (state: AppState, ownProps: OwnProps) => ({
        bookmark: selectBookmark(state, ownProps.id),
        canDo: selectors.selectCapabilities(state),
        requestStates: createRequestState(state, ownProps)
    });
}
type StateProps = ReturnType<ReturnType<typeof createMapStateToProps>>;

const BookmarkBlock: React.FC<ConnectedProps> = (props) => {
    const {
        archive: setArchived, remove, favorite: setFavorite, removeTag, addTag, setTags, select,
        bookmark, canDo, onLoad, id, width, requestStates
    } = props;

    const { image, tags, title, url, excerpt, archive, authors, favorite, resolvedUrl } = bookmark;

    const getReqStatus = (reqType: RequestType) => requestStates.reqStatus(reqType).state;

    const proxiedImage = image ? proxyImageSrc(image, width ? { w: width } : {}) : undefined;

    function getHostName(url: string) {
        if (!url) {
            return null;
        }

        var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
        return (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0)
            ? match[2] : null;
    }

    useEffect(() => {
        // call loaded if the main image wasn't set
        if (!image) {
            handleLoad();
        }
    }, [image, onLoad]);

    function handleLoad() {
        if (onLoad) {
            onLoad();
        }
    }

    function handleError(e: React.SyntheticEvent<HTMLDivElement, Event>) {
        (e.target as HTMLDivElement).style.display = "none";
        handleLoad();
    }

    const domain = getHostName(url);

    const styles =
    {
        media: {
            height: 0,
            paddingTop: '56.25%', // 16:9,
            marginTop: '30',
            backgroundSize: "contain",
            backgroundPosition: "center center",
        }
    };

    const showFavicon = false;
    const showMainImage = false;

    const handleRemoveTag = (tag: string) => canDo("modifyTags") ? () => { removeTag(tag); } : undefined;

    const buttonSize = 38;

    return (
        <Card>
            <CardHeader
                avatar={
                    showFavicon && <FaviconImg url={url} source="duckduckgo" alt="" width={24} height={24} />
                }
                title={title}
                subheader={domain}
            />

            {
                (showMainImage
                    && proxiedImage
                    && (<CardMedia
                        onLoad={handleLoad}
                        onError={handleError}
                        image={proxiedImage}
                        style={styles.media}
                    />)) || null
            }

            <CardContent>
                {excerpt &&
                    <Typography variant="body2" color="textSecondary" component="p">
                        {excerpt}
                    </Typography>
                }

                <div>
                    {!tags && (<span>NO TAGS</span>)}
                    {tags && tags.length &&
                        tags.map(t => <Chip key={t} label={t} onDelete={handleRemoveTag(t)} />)}
                </div>
            </CardContent>
            <CardActions disableSpacing>
                {canDo("favorite") &&
                    <LoadingButton
                        state={getReqStatus(RequestType.favorite)}
                        aria-label={favorite ? "Unfavorite bookmark" : "Favorite bookmark"}
                    onClick={e => setFavorite(!favorite)}
                    foregroundColor={favorite ? red[800] : common.black}
                        diameter={buttonSize}>
                        <FavoriteIcon />
                    </LoadingButton>
                }

                {canDo("archive") &&

                    <LoadingButton
                        state={getReqStatus(RequestType.archive)}
                        aria-label={archive ? "Unarchive bookmark" : "Archive bookmark"}
                        onClick={e => setArchived(!archive)}
                        diameter={buttonSize}>
                        <ArchiveIcon />
                    </LoadingButton>
                }

                {canDo("remove") &&
                    <LoadingButton
                        state={getReqStatus(RequestType.remove)}
                        aria-label="Remove bookmark"
                        onClick={e => { if (confirm("Are you sure?")) { remove(); } }}
                        diameter={buttonSize}>
                        <DeleteIcon />
                    </LoadingButton>
                }
            </CardActions>
        </Card>
    );
};

export default connect(createMapStateToProps, mapDispatchToProps)(BookmarkBlock);