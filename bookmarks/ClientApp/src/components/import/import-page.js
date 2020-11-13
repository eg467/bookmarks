import React, { Fragment } from 'react';
import PocketAuth from "../../components/pocket-auth/pocket-auth";
export default () => {
    return (React.createElement(Fragment, null,
        React.createElement("h1", null, "IMPORT"),
        React.createElement("h2", null, "Pocket"),
        React.createElement(PocketAuth, null)));
};
