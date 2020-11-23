import React, { Fragment } from "react";
import { actionCreators } from "../../redux/pocket/actions";
import { useHistory } from "react-router";
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";

export type PocketAuthProps = {};
export const PocketAuth: React.FC<PocketAuthProps> = () => {
   const history = useHistory();
   const {authError,username,awaitingAuthorization} = useStoreSelector(state => state.pocket);
   const dispatch = useStoreDispatch(); 
   const login = () => dispatch(actionCreators.login());
   const logout = () => dispatch(actionCreators.logout());

   const refererPath =
      history.location.state &&
      history.location.state.referer &&
      history.location.state.referer.pathname;

   if (awaitingAuthorization) {
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
         {authError && <div>{authError}</div>}
         <button onClick={login}>Login</button>
      </Fragment>
   );
};

export default React.memo(PocketAuth);
