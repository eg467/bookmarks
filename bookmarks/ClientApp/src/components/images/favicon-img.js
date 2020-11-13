import React from 'react';
export const FaviconImg = props => {
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
    let src;
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
    return React.createElement("img", Object.assign({ src: src, alt: alt }, rest));
};
export default React.memo(FaviconImg);
