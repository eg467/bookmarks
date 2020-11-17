import React, { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { AppState, MyThunkDispatch } from "../../redux/root/reducer";
//import { selectPocketAuth } from '../../redux/selectors';
import {
   actionCreators,
   actionCreators as authActionCreators,
} from "../../redux/pocket/auth/actions";
import { Redirect } from "react-router";
import {
   StoreDispatch,
   useStoreDispatch,
} from "../../redux/store/configureStore";
import { selectors } from "../../redux/pocket/auth/reducer";
import { Alert } from "@material-ui/lab";

export type CompleteAuthenticationProps = {};

const CompletePocketAuthentication = ({}: CompleteAuthenticationProps): JSX.Element => {
   console.log("CompletePocketAuthentication");
   
    
   const { error } = useSelector((state: AppState) => state.pocket.auth);

   const isAuthenticated = useSelector((state: AppState) =>
      selectors.isAuthenticated(state),
   );

   const dispatch = useStoreDispatch();

   useEffect(() => {
      dispatch(actionCreators.userAuthorized());
   }, []);

   if (!isAuthenticated) {
      return error ? (
         <div>
            Your Pocket authentication failed.
            <Alert severity="error">{error}</Alert>
         </div>
      ) : (
         <div>Accepting Authentication</div>
      );
   }

   return <Redirect to={"/bookmarks"} />;
};
export default CompletePocketAuthentication;
