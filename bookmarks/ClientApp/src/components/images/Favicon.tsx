import React from 'react';
import {getHostName} from "../../utils";
import {useStoreSelector} from "../../redux/store/configureStore";
import { selectors } from '../../redux/bookmarks/reducer';

export type FaviconImgProps = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
    faviconUrl: string;
    proxySource?: "duckduckgo" | "google" | "favicon.ico"
    width?: number,
    height?: number,
}

export const Favicon: React.FC<FaviconImgProps> = ({
   proxySource = "duckduckgo",
   faviconUrl,
   width = 64,
   height = 64, 
   alt =  "Site icon",
   ...rest
}) => {
    if (!faviconUrl) {
        return null;
    }
    
    rest.style = Object.assign(
       rest.style || {},
       {width, height} as React.CSSProperties);

    const domain = getHostName(faviconUrl);

    let src: string;
    switch (proxySource) {
        case "google":
            src = `https://s2.googleusercontent.com/s2/favicons?domain_url=${domain}`;
            break;
        case "duckduckgo":
            src = `https://icons.duckduckgo.com/ip2/${domain}.ico`;
            break;
        default:
            src = `//${domain}/favicon.ico`;
            break;
    }
    
    return <img src={src} alt={alt} {...rest} />
};

export const BookmarkFavicon: React.FC<FaviconImgProps> = React.memo(
   ({faviconUrl, ...props}) => {
      
    return (
        <Favicon
           faviconUrl={faviconUrl}
           proxySource="duckduckgo"
           alt=""
           width={24}
           height={24}
           {...props}
        />
    );
});

export type BookmarkFaviconByIdProps = Omit<FaviconImgProps, "faviconUrl"> & {
   bookmarkId: string
};
export const BookmarkFaviconById: React.FC<BookmarkFaviconByIdProps> = React.memo(
   ({bookmarkId, ...rest}) => {
      console.log("BookmarkFaviconById: " + bookmarkId);
       const url = useStoreSelector(s => selectors.selectBookmark(s, bookmarkId).url);
       return <BookmarkFavicon faviconUrl={url} {...rest} />; 
   });


export default React.memo(Favicon);