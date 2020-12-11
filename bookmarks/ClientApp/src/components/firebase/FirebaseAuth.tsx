import * as React from 'react';
import {useFirebaseAuth, useFirebaseUser} from "../../api/firebase/firebase";
import {FormControlLabel, FormLabel, TextField, Button, makeStyles, Theme, createStyles} from "@material-ui/core";
import {useMemo, useState} from "react";
import {Alert, AlertTitle} from "@material-ui/lab";
import {SelectedButtonGroup} from "../common/SelectedButtonGroup";

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      rootContainer: {
         padding: theme.spacing(2),
         margin: theme.spacing(2),
      },
      formInput: {
         display: "block",
         margin: theme.spacing(1.5),
      },
      submitContainer: {
         "& > *": {
            margin: theme.spacing(1),
         },
         margin: theme.spacing(2, 0),
      },
      loginButton: {
         margin: theme.spacing(2),
      }
   })
);

export const FirebaseLogin: React.FC<FirebaseAuthProps> = ({}) => {
   const classes = useStyles();
   const {login, sendPasswordReset} = useFirebaseAuth();

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");

   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>)=> {
      event.preventDefault();
      if(!email || !password) {
         return;
      }
      try {
         setError("");
         await login(email, password);
      } catch(e) {
         setError(String(e));
      }
   };


   return (
      <form onSubmit={handleSubmit}>
         <h3>Login</h3>
         {error && <Alert severity="error">{error}</Alert>}
         <TextField
            variant="outlined"
            className={classes.formInput}
            type="email"
            label="Email"
            required={true}
            value={email}
            onChange={e => setEmail(e.target.value)}
         />
         <TextField
            variant="outlined"
            className={classes.formInput}
            type="password"
            label="password"
            required={true}
            value={password}
            onChange={e => setPassword(e.target.value)}
         />
         <div>
            <Button
               disabled={!email}
               onClick={() => sendPasswordReset(email)}
               variant="text"
            >
               Forgot your password?
            </Button>
         </div>

         <div className={classes.submitContainer}>
            <Button
               color="primary"
               type="submit"
               variant="contained"
               value="login"
            >
               Login
            </Button>
         </div>
      </form>
   );
};

export const FirebaseRegister: React.FC<FirebaseAuthProps> = ({}) => {
   const classes = useStyles();
   const {createAccount} = useFirebaseAuth();

   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");

   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>)=> {
      event.preventDefault();
      if(!username || !password) {
         return;
      }
      try {
         setError("");
         await createAccount(username, password);
      } catch(e) {
         setError(String(e));
      }
   };


   return (
      <form onSubmit={handleSubmit}>
         <h3>Create an Account</h3>
         {error && <Alert severity="error">{error}</Alert>}
         <TextField
            variant="outlined"
            className={classes.formInput}
            type="email"
            label="Email"
            required={true}
            value={username}
            onChange={e => setUsername(e.target.value)}
         />
         <TextField
            variant="outlined"
            className={classes.formInput}
            type="password"
            label="password"
            required={true}
            value={password}
            onChange={e => setPassword(e.target.value)}
         />

         <div className={classes.submitContainer}>
            <Button
               color="primary"
               type="submit"
               variant="contained"
               value="login"
            >
               Create Account
            </Button>
         </div>
      </form>
   );
};


export const FirebaseLoginOrRegister: React.FC<FirebaseAuthProps> = ({}) => {
   const [selectedOption, setSelectedOption] = useState("login");
   const options = useMemo(() => new Map([
      ["Login", "login"],
      ["Create an Account", "register"]
   ]), []);

   return (
      <div>
         <SelectedButtonGroup<string> options={options} defaultSelection={selectedOption} onSelectionChange={setSelectedOption} />
         {selectedOption === "login" && <FirebaseLogin/>}
         {selectedOption === "register" && <FirebaseRegister/>}
      </div>
   )
};


export const FirebaseLogout: React.FC<FirebaseAuthProps> = ({}) => {
   const {user, logout} = useFirebaseAuth();
   const classes = useStyles();
   
   if(!user) {
      return <FirebaseLogin/>;
   }

   return (
      <div>
         <Alert severity="success">
            You are logged in as <b>{user.email}</b> ({user.emailVerified ? "verified" : "unverified, please check your email"}).
         </Alert>
         <Button
            variant="outlined"
            color="secondary"
            className={classes.loginButton}
            onClick={e => logout()}
         >
            Logout
         </Button>
      </div>
   );
};

export type FirebaseAuthProps = {
   
};

export const FirebaseAuth: React.FC<FirebaseAuthProps> = ({}) => {

   const classes = useStyles();
   const user = useFirebaseUser();
   return (
      <div className={classes.rootContainer}>
         {!user && <FirebaseLoginOrRegister/>}
         {user && <FirebaseLogout/>}
      </div>
   );
};


