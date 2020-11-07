import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { selectors } from '../../redux/selectors';
import { actionCreators } from '../../redux/pocket/auth/actions';
import { AppState, MyThunkDispatch } from '../../redux/root/reducer';
import { withRouter, RouteComponentProps, StaticContext } from 'react-router';
import * as H from 'history';

interface HistoryState {
    referer: H.Location;
}

export interface PocketAuthProps extends StateProps, DispatchProps, RouteComponentProps<{}, StaticContext, HistoryState> {
}

export const PocketAuth: React.FC<PocketAuthProps> = (props) => {
    const {
        loading,
        username,
        error,
    } = props;

    const refererPath =
        props.location.state
        && props.location.state.referer
        && props.location.state.referer.pathname;

    if (loading) {
        return <div>Loading...</div>;
    }

    if (username) {
        return (
            <div>
                {`You are logged in as ${username}.`}
                <button onClick={props.logout}>Log out</button>
            </div>
        );
    }

    const login = async () => {
        await props.login();
    };

    return (
        <Fragment>
            {refererPath && <div>You will be redirected to: <b>{refererPath}</b></div>}
            {error && <div>{error}</div>}
            <button onClick={login}>Login</button>
        </Fragment>
    );
};

const mapStateToProps = (state: AppState) => {
    const s = selectors.selectPocketState(state).auth || {};
    return {
        error: s.error,
        username: s.username,
        loading: s.loading,
    };
};

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
    login: () => dispatch(actionCreators.initAuthentication()),
    logout: () => dispatch(actionCreators.logout()),
    // refresh: () => dispatch(continueAuthentication()),
});

type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type StateProps = ReturnType<typeof mapStateToProps>;

export default withRouter(React.memo(connect(mapStateToProps, mapDispatchToProps)(PocketAuth)));