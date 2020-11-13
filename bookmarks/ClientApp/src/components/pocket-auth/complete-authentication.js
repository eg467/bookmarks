import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
//import { selectPocketAuth } from '../../redux/selectors';
import { actionCreators as authActionCreators } from "../../redux/pocket/auth/actions";
import { Redirect } from "react-router";
import { selectors } from "../../redux/pocket/auth/reducer";
const CompleteAuthentication = ({ continueAuthentication, username, }) => {
    const [loggedIn, setLoggedIn] = useState(null);
    useEffect(() => {
        continueAuthentication().then(setLoggedIn, () => setLoggedIn(false));
    }, [continueAuthentication]);
    if (loggedIn === null) {
        return React.createElement("div", null, "Accepting Authentication");
    }
    if (!loggedIn) {
        return React.createElement("div", null, "Your Pocket authentication failed.");
    }
    return React.createElement(Redirect, { to: "/b/pocket" });
};
const mapDispatchToProps = (dispatch /* MyThunkDispatch */) => ({
    continueAuthentication: () => dispatch(authActionCreators.continueAuthentication()),
});
const mapStateToProps = (state) => ({
    username: selectors.username(state),
});
export default React.memo(connect(mapStateToProps, mapDispatchToProps)(CompleteAuthentication));
