import React from "react";

const TransparentImage = React.memo(function (props: any) {
   return (<img
      {...props}
      src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
      alt=""
   />);
});

export default TransparentImage;