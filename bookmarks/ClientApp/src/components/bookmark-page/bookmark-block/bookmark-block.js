import React, { useEffect } from "react";
import { connect } from "react-redux";
import { selectBookmark, selectors } from "../../../redux/bookmarks/reducer";
import { RequestType, selectors as reqStateSelectors, } from "../../../redux/request-states/reducer";
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
const mapDispatchToProps = (dispatch, ownProps) => ({
    archive: (status) => dispatch(actionCreators.archive(ownProps.bookmarkId, status)),
    remove: () => dispatch(actionCreators.remove(ownProps.bookmarkId)),
    favorite: (status) => dispatch(actionCreators.favorite({ keys: ownProps.bookmarkId, status })),
    removeTag: (tag) => dispatch(actionCreators.modifyTags({
        keys: ownProps.bookmarkId,
        operation: TagModification.remove,
        tags: tag,
    })),
    addTag: (tag) => dispatch(actionCreators.modifyTags({
        keys: ownProps.bookmarkId,
        operation: TagModification.add,
        tags: tag,
    })),
    setTags: (tags) => dispatch(actionCreators.modifyTags({
        keys: ownProps.bookmarkId,
        operation: TagModification.set,
        tags,
    })),
    select: () => {
        /* Implement bulk selection/edit feature. */
    },
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createMapStateToProps() {
    const createRequestState = reqStateSelectors.createSelectRequestState();
    return (state, ownProps) => ({
        bookmark: selectBookmark(state, ownProps.bookmarkId),
        canDo: selectors.selectCapabilities(state),
        requestStates: createRequestState(state, ownProps),
    });
}
const useStyles = makeStyles(() => createStyles({
    media: {
        height: 0,
        paddingTop: "56.25%",
        marginTop: "30",
        backgroundSize: "contain",
        backgroundPosition: "center center",
    },
}));
const BookmarkBlock = (props) => {
    const { archive: setArchived, remove, favorite: setFavorite, bookmark, canDo, onLoad, bookmarkId, width, requestStates, } = props;
    const classes = useStyles();
    const { image, tags, title, url, excerpt, archive, favorite } = bookmark;
    const getReqStatus = (reqType) => requestStates.reqStatus(reqType).state;
    const proxiedImage = image
        ? proxyImageSrc(image, width ? { w: width } : {})
        : undefined;
    function getHostName(url) {
        if (!url) {
            return null;
        }
        const a = document.createElement("a");
        a.href = url;
        return a.host;
    }
    function handleLoad() {
        if (onLoad) {
            onLoad();
        }
    }
    function handleError(e) {
        e.target.style.display = "none";
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
    const FavoriteButton = () => (React.createElement(LoadingButton, { state: getReqStatus(RequestType.favorite), "aria-label": favorite ? "Unfavorite bookmark" : "Favorite bookmark", onClick: () => setFavorite(!favorite), foregroundColor: favorite ? red[800] : common.black, diameter: buttonSize },
        React.createElement(FavoriteIcon, null)));
    const ArchiveButton = () => (React.createElement(LoadingButton, { state: getReqStatus(RequestType.archive), "aria-label": archive ? "Unarchive bookmark" : "Archive bookmark", onClick: () => setArchived(!archive), diameter: buttonSize },
        React.createElement(ArchiveIcon, null)));
    const DeleteButton = () => (React.createElement(LoadingButton, { state: getReqStatus(RequestType.remove), "aria-label": "Remove bookmark", onClick: () => {
            if (window.confirm("Are you sure?")) {
                // noinspection JSIgnoredPromiseFromCall
                remove();
            }
        }, diameter: buttonSize },
        React.createElement(DeleteIcon, null)));
    return (React.createElement(Card, null,
        React.createElement(CardHeader, { avatar: showFavicon && (React.createElement(FaviconImg, { url: url, source: "duckduckgo", alt: "", width: 24, height: 24 })), title: title, subheader: domain }),
        (showMainImage && proxiedImage && (React.createElement(CardMedia, { onLoad: handleLoad, onError: handleError, image: proxiedImage, className: `${classes.media}` }))) ||
            null,
        React.createElement(CardContent, { style: { overflowY: "auto" } },
            excerpt && (React.createElement(Typography, { variant: "body2", color: "textSecondary", component: "p" }, excerpt)),
            React.createElement("div", null,
                React.createElement(BookmarkTagEditor, { values: tags, bookmarkId: bookmarkId }))),
        React.createElement(CardActions, null,
            canDo("favorite") && FavoriteButton(),
            canDo("archive") && ArchiveButton(),
            canDo("remove") && DeleteButton())));
};
export default connect(createMapStateToProps, mapDispatchToProps)(BookmarkBlock);
