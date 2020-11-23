import React, { useEffect} from "react";
import { useSelector } from "react-redux";
import { AppState} from "../../redux/root/reducer";
//import { selectPocketAuth } from '../../redux/selectors';
import {
   actionCreators,
   
} from "../../redux/pocket/actions";
import { Redirect } from "react-router";
import {
   useStoreDispatch, useStoreSelector,
} from "../../redux/store/configureStore";
import { selectors } from "../../redux/pocket/reducer";
import { Alert } from "@material-ui/lab";

export type CompleteAuthenticationProps = {};

const CompletePocketAuthentication = ({}: CompleteAuthenticationProps): JSX.Element => {
   console.log("CompletePocketAuthentication");
   
    
   const { authError } = useStoreSelector(state => state.pocket);

   const isAuthenticated = useStoreSelector(state =>
      selectors.isAuthenticated(state),
   );

   const dispatch = useStoreDispatch();

   useEffect(() => {
      dispatch(actionCreators.userAuthorized());
   }, []);

   if (!isAuthenticated) {
      return authError ? (
         <div>
            Your Pocket authentication failed.
            <Alert severity="error">{authError}</Alert>
         </div>
      ) : (
         <div>Accepting Authentication</div>
      );
   }

   return <Redirect to={"/bookmarks"} />;
};
export default CompletePocketAuthentication;
