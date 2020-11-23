import {Button, ButtonProps, CircularProgress} from "@material-ui/core";
import React from "react";
import {useStoreDispatch} from "../../redux/store/configureStore";
import {actionCreators} from "../../redux/pocket/actions";

export type PocketAuthButtonProps = ButtonProps & {
   username: string;
   loading: boolean;
}
export const PocketAuthButton: React.FC<PocketAuthButtonProps> = ({
   username,
   loading,
   ...rest
}) => {
   const dispatch = useStoreDispatch();
   const login = () => dispatch(actionCreators.login());
   const logout = () => dispatch(actionCreators.logout());

   if(loading) {
      return <CircularProgress />;
   } else if(username) {
      return (
         <Button size="large" variant="contained" color="default" {...rest} onClick={logout}>
            Logout
         </Button>
      )
   } else {
      return (
         <Button variant="contained" color="primary" size="large" {...rest} onClick={login}>
            Login or Create an Account
         </Button>
      );
   }
}
export default PocketAuthButton;