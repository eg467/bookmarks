import React from "react";

export interface ProxiedImgProps extends ProxyOptions {
   [key: string]: any;
   src: string;
   alt: string;
}

export interface ProxyOptions {
   [key: string]: any;

   // WESERVE OPTIONS BELOW
   errorredirect?: string;
   /** width */
   w?: number;
   /** height */
   h?: number;
   /** quality (1-100) */
   q?: number;
   /** output encoding */
   output?: "jpg" | "png" | "gif" | "tiff" | "webp";
   /** interpolation / progressive rendering */
   il?: boolean | null;
}

export const proxyImageSrc = (originalSrc: string, options: ProxyOptions = {}) => {
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

export const ProxiedImg = React.forwardRef<HTMLImageElement, ProxiedImgProps & {}>((props, ref) => {
   const { errorredirect, src, w, h, q, output, il, alt, ...rest } = props;
   return (
      <img
         src={proxyImageSrc(src, props)}
         ref={ref}
         alt={alt||""}
         {...rest}
       />
   );
});

export default React.memo(ProxiedImg);