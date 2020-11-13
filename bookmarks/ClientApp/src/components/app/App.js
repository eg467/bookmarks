import React from 'react';
import './App.css';
import { /* match as Match, */ Switch, Redirect } from 'react-router';
import { Route, BrowserRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import CompleteAuthentication from '../pocket-auth/complete-authentication';
import Test from '../testing/test';
import { actionCreators } from '../../redux/pocket/auth/actions';
import { selectors as authSelectors } from '../../redux/pocket/auth/reducer';
import ImportPage from '../../components/import/import-page';
import BookmarkPage from '../../components/bookmark-page/bookmark-page';
// BOOKMARKS
const mapStateToProps = (state) => ({
    loggedIn: authSelectors.isAuthenticated(state),
});
const mapDispatchToProps = (dispatch) => ({
    refreshAuthentication: () => dispatch(actionCreators.continueAuthentication()),
});
export const App = (props) => {
    return (React.createElement(BrowserRouter, null,
        React.createElement("h1", null, "Bookmarks Page"),
        "You are ",
        props.loggedIn ? "Logged in" : "Not logged in",
        React.createElement(Switch, null,
            React.createElement(Route, { path: "/test", component: Test }),
            React.createElement(Route, { path: "/import", component: ImportPage }),
            React.createElement(Route, { path: "/authenticated", component: CompleteAuthentication }),
            React.createElement(PrivateRoute, { authed: props.loggedIn, path: "/b/pocket", component: BookmarkPage }),
            React.createElement(Route, { path: "/", render: () => React.createElement(Redirect, { to: "/b/pocket" }) }))));
};
function PrivateRoute({ component: PassedComponent, authed, ...rest }) {
    return (React.createElement(Route, Object.assign({}, rest, { render: (props) => authed === true
            // Go here if logged in.
            ? React.createElement(PassedComponent, Object.assign({}, props))
            // Go here if unauthenticated in order to log in.
            : React.createElement(Redirect, { to: { pathname: '/import', state: { referer: props.location } } }) })));
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
