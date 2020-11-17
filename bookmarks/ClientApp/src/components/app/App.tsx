import React from "react";
import "./App.css";
import { /* match as Match, */ Switch, Redirect } from "react-router";
import { Route, BrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppState } from "../../redux/root/reducer";
import Test from "../testing/test";
import { selectors as authSelectors } from "../../redux/pocket/auth/reducer";
import ImportPage from "../../components/import/ImportPage";
import CompletePocketAuthentication from "../pocket-auth/CompletePocketAuthentication";
import { PocketAuth } from "../pocket-auth/PocketAuth";
import BookmarkPage from "../bookmark-page/BookmarkPage";

// BOOKMARKS

export type AppProps = {
   // Custom props
};

export const App: React.FC<AppProps> = () => {
   const pocketAuthenticated = useSelector((state: AppState) =>
      authSelectors.isAuthenticated(state),
   );
   return (
      <BrowserRouter> 
         <PocketAuth />
         <h1>Bookmarks 3</h1> 
         <Switch>   
            <Route path="/test" component={Test} />
            <Route path="/import" component={ImportPage} />
            <Route 
               path="/authenticated"
               component={CompletePocketAuthentication}
            />
             <Route
                 path="/bookmarks"
                 component={BookmarkPage}
             />

            <Route
               path="/"
               render={(): JSX.Element => <Redirect to="/bookmarks" />}
            />
         </Switch>
      </BrowserRouter>
   );
};

type PrivateRouteProps = {
   component: any;
   authed: boolean;
   loginPath: string;
} & {
   [key: string]: any;
};

function PrivateRoute({
   component: PassedComponent,
   loginPath,
   authed,
   ...rest
}: PrivateRouteProps): JSX.Element {
   return (
      <Route
         {...rest}
         render={(props): JSX.Element =>
            authed ? (
               <PassedComponent {...props} />
            ) : (
               <Redirect
                  to={{
                     pathname: loginPath,
                     state: { referer: props.location },
                  }}
               />
            )
         }
      />
   );
}

export default App;
