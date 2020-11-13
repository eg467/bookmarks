import React from "react";
const TransparentImage = React.memo(function (props) {
    return (React.createElement("img", Object.assign({}, props, { src: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", alt: "" })));
});
export default TransparentImage;
