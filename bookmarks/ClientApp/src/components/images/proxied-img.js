import React from "react";
export const proxyImageSrc = (originalSrc, options = {}) => {
    const { errorredirect, src, w, h, q, output, il, ...rest } = options;
    const url = [`https://images.weserv.nl/?url=${encodeURIComponent(originalSrc)}`];
    const weservFields = ["errorredirect", "w", "h", "q", "output", "il"];
    weservFields
        .filter(field => options[field] !== undefined)
        .forEach(field => {
        const val = String(options[field]);
        const encodedVal = encodeURIComponent(val);
        url.push(`&${field}=${encodedVal}`);
    });
    return url.join("");
};
export const ProxiedImg = React.forwardRef((props, ref) => {
    const { errorredirect, src, w, h, q, output, il, ...rest } = props;
    return (React.createElement("img", Object.assign({ src: proxyImageSrc(src, props), ref: ref }, rest)));
});
export default React.memo(ProxiedImg);
