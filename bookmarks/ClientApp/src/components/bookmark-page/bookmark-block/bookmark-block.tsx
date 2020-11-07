import React, { useEffect, memo } from 'react';
import { connect } from "react-redux";
import { StoreDispatch } from "../../../redux/store/configureStore";
import { AppState } from "../../../redux/root/reducer";
import { selectBookmark } from "../../../redux/bookmarks/reducer";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardHeader from "@material-ui/core/CardHeader";
import { FaviconImg } from "../../images/favicon-img";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import Chip from "@material-ui/core/Chip";
import { proxyImageSrc } from '../../images/proxied-img';

interface ConnectedProps extends DispatchProps, StateProps, OwnProps {
}

interface OwnProps {
    id: string;
    /** The width of the block for requesting the optimized image size */
    width?: number;
    onLoad?: () => void;
}

const mapDispatchToProps = (dispatch: StoreDispatch) => ({
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

const mapStateToProps = (state: AppState, ownProps: OwnProps) => ({
    ...selectBookmark(state.bookmarks, ownProps.id),
});
type StateProps = ReturnType<typeof mapStateToProps>;

const BookmarkBlock: React.FC<ConnectedProps> = (props) => {
    const {
        onLoad, id, width, image, tags, title, url, excerpt,  /* , archive, authors,  favorite, id,  resolvedUrl, time_added*/
    } = props;

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



    //return (<div>{ <a href={url}>{title}</a> }</div>);

    return (
        <Card>
            <CardHeader
                avatar={
                    showFavicon && <FaviconImg url={ url } source="duckduckgo" alt="" width={ 24} height={ 24} />
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
                    {tags && tags.length && tags.map(t => <Chip key={t} label={t} />)}
                </div>
            </CardContent>
            <CardActions disableSpacing>
                <IconButton aria-label="Add to favorites">
                    <FavoriteIcon />
                </IconButton>
                <IconButton aria-label="Share">
                    <ShareIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkBlock);