import React, { Fragment } from "react";
import { actionCreators } from "../../redux/pocket/actions";
import { useHistory } from "react-router";
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";
import {Button} from "@material-ui/core";
import {Alert, AlertTitle} from "@material-ui/lab";
import PocketAuthButton from "./PocketAuthButton";

export type PocketAuthProps = {
   className?: string;
};

const style = {
   button: {
      margin: 10,
   }
}

export const PocketAuth: React.FC<PocketAuthProps> = ({
   className
}) => {
   const {authError,username,awaitingAuthorization} = useStoreSelector(state => state.pocket);

   if (awaitingAuthorization) {
      return <div>Awaiting authorization...</div>;
   }
    
   return (
     <div className={className}>
         {username &&
            <Alert severity="success">You are logged in as <b>{username}</b>.</Alert>
         }
         {authError &&
            <Alert severity="error">
               <AlertTitle>Authentication Error</AlertTitle>
              {authError}
            </Alert>
         }

         <PocketAuthButton style={style.button} username={username} loading={awaitingAuthorization} />
      </div>
   ); 
};

export default React.memo(PocketAuth);
