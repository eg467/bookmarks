import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { selectors } from '../../redux/selectors';
import { actionCreators } from '../../redux/pocket/auth/actions';
import { withRouter } from 'react-router';
export const PocketAuth = (props) => {
    const { loading, username, error, } = props;
    const refererPath = props.location.state
        && props.location.state.referer
        && props.location.state.referer.pathname;
    if (loading) {
        return React.createElement("div", null, "Loading...");
    }
    if (username) {
        return (React.createElement("div", null,
            `You are logged in as ${username}.`,
            React.createElement("button", { onClick: props.logout }, "Log out")));
    }
    const login = async () => {
        await props.login();
    };
    return (React.createElement(Fragment, null,
        refererPath && React.createElement("div", null,
            "You will be redirected to: ",
            React.createElement("b", null, refererPath)),
        error && React.createElement("div", null, error),
        React.createElement("button", { onClick: login }, "Login")));
};
const mapStateToProps = (state) => {
    const s = selectors.selectPocketState(state).auth || {};
    return {
        error: s.error,
        username: s.username,
        loading: s.loading,
    };
};
const mapDispatchToProps = (dispatch) => ({
    login: () => dispatch(actionCreators.initAuthentication()),
    logout: () => dispatch(actionCreators.logout()),
});
export default withRouter(React.memo(connect(mapStateToProps, mapDispatchToProps)(PocketAuth)));
