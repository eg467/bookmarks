import React from 'react';

export interface FaviconImgProps {
    [key: string]: any;
    url: string;
    alt: string;
    source?: "duckduckgo" | "google" | "favicon.ico"
}

export const FaviconImg: React.FC<FaviconImgProps> = props => {
    props = Object.assign({
        source: "duckduckgo",
        alt: "Site icon",
        width: 64,
        height: 64,
    }, props);

    const { alt, source, url, localCache, ...rest } = props;

    if (!url) {
        return null;
    }
    const domain = url
        .replace("ftp://", "")
        .replace("http://", "")
        .replace("https://", "")
        .split(/[/?#]/)[0];

    let src: string;
    switch (props.source) {
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

export default React.memo(FaviconImg);