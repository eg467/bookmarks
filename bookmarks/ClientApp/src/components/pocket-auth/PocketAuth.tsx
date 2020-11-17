import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { actionCreators } from "../../redux/pocket/auth/actions";
import { AppState } from "../../redux/root/reducer";
import { useHistory, withRouter } from "react-router";
import * as H from "history";
import { useStoreDispatch } from "../../redux/store/configureStore";

interface HistoryState {
   referer: H.Location;
}

export type PocketAuthProps = {};
export const PocketAuth: React.FC<PocketAuthProps> = ({}) => {
   const history = useHistory();
   const auth = useSelector((s: AppState) => s.pocket.auth);
   const { error, loading, username } = auth;
   const dispatch = useStoreDispatch(); 
   const login = () => dispatch(actionCreators.login());
   const logout = () => dispatch(actionCreators.logout());

   const refererPath =
      history.location.state &&
      history.location.state.referer &&
      history.location.state.referer.pathname;

   if (loading) {
      return <div>Loading...</div>;
   }
    
   if (username) {
      return (
         <div>
            {`You are logged in as ${username}.`}
            <button onClick={logout}>Log out of Pocket</button>
         </div>
      );
   }

   return (
      <Fragment>
         {refererPath && (
            <div>
               You will be redirected to: <b>{refererPath}</b>
            </div>
         )}
         {error && <div>{error}</div>}
         <button onClick={login}>Login</button>
      </Fragment>
   );
};

export default withRouter(React.memo(PocketAuth));
