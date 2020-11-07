import React, { } from 'react';
import './App.css';
import { /* match as Match, */ Switch, Redirect } from 'react-router';
import { Route, BrowserRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { AppState, MyThunkDispatch } from '../../redux/root/reducer';
import CompleteAuthentication from '../pocket-auth/complete-authentication';
import Test from '../testing/test';
import { actionCreators } from '../../redux/pocket/auth/actions';
import { selectors as authSelectors } from '../../redux/pocket/auth/reducer';
import ImportPage from '../../components/import/import-page';
import BookmarkPage from '../../components/bookmark-page/bookmark-page';

// BOOKMARKS

const mapStateToProps = (state: AppState) => ({
    loggedIn: authSelectors.isAuthenticated(state),
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
    refreshAuthentication: () => dispatch(actionCreators.continueAuthentication()),
})

export interface AppProps extends AppStateProps, AppDispatchProps {
    // Custom props
}

export type AppStateProps = ReturnType<typeof mapStateToProps>;
export type AppDispatchProps = ReturnType<typeof mapDispatchToProps>;

export const App: React.FC<AppProps> = (props) => {
    return (
        <BrowserRouter>
            <h1>Bookmarks Page</h1>
         You are {props.loggedIn ? "Logged in" : "Not logged in"}
            <Switch>
                {/* <Route path="/bookmarks" component={ConnectedBookmarks} /> */}
                <Route path="/test" component={Test} />
                <Route path="/import" component={ImportPage} />
                <Route path="/authenticated" component={CompleteAuthentication} />
                <PrivateRoute
                    authed={props.loggedIn}
                    path="/b/pocket"
                    component={BookmarkPage}
                />
                <Route path="/" render={() => <Redirect to="/b/pocket" />} />
            </Switch>
        </BrowserRouter>
    );
};

type PrivateRouteProps = { component: any, authed: boolean } & { [key: string]: any };
function PrivateRoute({ component: PassedComponent, authed, ...rest }: PrivateRouteProps) {
    return (
        <Route
            {...rest}
            render={(props) => authed === true
                // Go here if logged in.
                ? <PassedComponent {...props} />
                // Go here if unauthenticated in order to log in.
                : <Redirect to={{ pathname: '/import', state: { referer: props.location } }} />}
        />
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(App);