import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { AppState, MyThunkDispatch } from "../../redux/root/reducer";
//import { selectPocketAuth } from '../../redux/selectors';
import { actionCreators as authActionCreators } from "../../redux/pocket/auth/actions";
import { Redirect } from "react-router";
import { StoreDispatch } from "../../redux/store/configureStore";
import { selectors } from "../../redux/pocket/auth/reducer";

interface ConnectedProps extends DispatchProps, StateProps {}

export type CompleteAuthenticationProps = ConnectedProps;

const CompleteAuthentication: React.FC<CompleteAuthenticationProps> = ({
   continueAuthentication,
   username,
}) => {
   const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

   useEffect(() => {
      continueAuthentication().then(setLoggedIn, () => setLoggedIn(false));
   }, [continueAuthentication]);

   if (loggedIn === null) {
      return <div>Accepting Authentication</div>;
   }
   if (!loggedIn) {
      return <div>Your Pocket authentication failed.</div>;
   }

   return <Redirect to={"/b/pocket"} />;
};

const mapDispatchToProps = (dispatch: StoreDispatch /* MyThunkDispatch */) => ({
   continueAuthentication: () =>
      dispatch(authActionCreators.continueAuthentication()),
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

const mapStateToProps = (state: AppState) => ({
   username: selectors.username(state),
});
type StateProps = ReturnType<typeof mapStateToProps>;

export default React.memo(
   connect(mapStateToProps, mapDispatchToProps)(CompleteAuthentication),
);
