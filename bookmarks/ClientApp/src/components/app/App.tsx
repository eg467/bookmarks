import React from "react";
import "./App.css";
import {Redirect, Switch} from "react-router";
import {BrowserRouter, Route} from "react-router-dom";
import Test from "../testing/test";
import ImportPage from "../../components/import/ImportPage";
import CompletePocketAuthentication from "../pocket-auth/CompletePocketAuthentication";
import BookmarkPage from "../bookmark-page/BookmarkPage";
import {useStoreSelector} from "../../redux/store/configureStore";
import {BookmarkSourceType} from "../../redux/bookmarks/reducer";

// BOOKMARKS
export type AppProps = {
   // Custom props
};

export const App: React.FC<AppProps> = () => {
   return (
      <BrowserRouter> 
         <Switch>   
            <Route path="/import" component={ImportPage} />
            <Route path="/authenticated" component={CompletePocketAuthentication} />
            <RouteRequiringBookmarks path="/bookmarks" component={BookmarkPage} />
            <RouteRequiringBookmarks path="/export" component={BookmarkPage} />
            <Route path="/" render={(): JSX.Element => <Redirect to="/bookmarks" />} />
         </Switch>
      </BrowserRouter>
   );
}; 

type PrivateRouteProps = {
   component: any;
} & {
   [key: string]: any;
};

function RouteRequiringBookmarks({
   component: PassedComponent,
   ...rest
}: PrivateRouteProps): JSX.Element {
   const hasSource = useStoreSelector(s => s.bookmarks.source.type !== BookmarkSourceType.none);
   return (
      <Route
         {...rest}
         render={(props): JSX.Element =>
            hasSource ? (
               <PassedComponent {...props} />
            ) : (
               <Redirect
                  to={{
                     pathname: "/import",
                     state: { referer: props.location },
                  }}
               />
            )
         }
      />
   );
}

export default App;
