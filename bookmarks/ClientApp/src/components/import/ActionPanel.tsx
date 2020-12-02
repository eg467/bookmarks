import React, {PropsWithChildren, useCallback, useEffect, useMemo, useState} from "react";
import {Button, Card, CardActions, CardContent, createStyles, makeStyles, Theme, Typography, CircularProgress} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";
import { useHistory } from "react-router-dom";
import {Alert, AlertTitle} from "@material-ui/lab";
import {BookmarkSource, BookmarkState, SourcedBookmarks} from "../../redux/bookmarks/reducer";
import {BookmarkCollection} from "../../redux/bookmarks/bookmarks";
import {useStoreDispatch} from "../../redux/store/configureStore";
import {actionCreators} from "../../redux/bookmarks/actions";

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      root: {
         backgroundColor: theme.palette.background.paper,
         //display: "inline-block",

         "& a": {
            color: grey[800]
         }
      },
      content: {
        padding: theme.spacing(3), 
      },
      nested: {
         paddingLeft: theme.spacing(4),
      },
   }),
);

/**
 * The function to invoke on submission, false to disable submission, null to hide submission element.
 */
export type SubmitHandler<R extends {}> = (()=>Promise<R>) | null | false;

export type ActionPanelChildProps<R extends {}> = {
   setHandler?: (handler: SubmitHandler<R>) => void;
}


export type ActionPanelProps<R extends {}, C extends ActionPanelChildProps<R>> = {
   children: React.ReactElement<C>;
   header: string;
   subheader?: string;
   onSubmitted?: (results: Promise<R>) => void;
   submitButtonContents?: React.ReactElement;
};

export const ActionPanel = <R extends {}, C extends ActionPanelChildProps<R>>({
   children,
   header, 
   subheader,
   onSubmitted,
   submitButtonContents,
}: ActionPanelProps<R, C>): React.ReactElement<ActionPanelProps<R, C>> => {
   const classes = useStyles();

   const {loading,submit,setHandler,canPerform,disabled,error,submitVisible} = useSubmitHandler<R>();
   
   const handleSubmit = () => {
      if(canPerform) {
         onSubmitted ? onSubmitted(submit()) : submit();
      }
   };
   
   // Inject the action handler setter prop into the child
   const newChildren = React.Children.map(
      children, c => React.cloneElement<ActionPanelChildProps<R>>(c, {setHandler}))
   
   return (<Card className={classes.root}>
         <CardContent className={classes.content}>
            {header &&
            <Typography gutterBottom variant="h3" component="h3">
               {header}
            </Typography>
            }

            {error && <Alert severity="error">{error}</Alert>}

            {subheader &&
            <Typography gutterBottom variant="subtitle1" component="h4">
               {subheader}
            </Typography>
            }

            {newChildren}
         </CardContent>
         <CardActions>
            {submitVisible && !loading &&
               <Button size="large" disabled={disabled} variant="contained" color="primary" onClick={handleSubmit}>
                  {submitButtonContents || "Submit"}
               </Button>
            }
            
            { loading && <CircularProgress /> }
         </CardActions>
      </Card>
   );
}

function useSubmitHandler<TReturn>() {
   const [handler, setHandler] = useState<SubmitHandler<TReturn>>(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const submit = useCallback((): Promise<TReturn> => {
      if(!handler) {
         const errorMessage = "The form is not in a state to accept submission.";
         setError(errorMessage);
         return Promise.reject(Error(errorMessage));
      }

      setError("");
      setLoading(true);
      return handler().then<TReturn>(
         r=> {
            setError("");
            setLoading(false);
            return r;
         },
         e=> {
            setError(String(e));
            setLoading(false);
            console.error(e);
            return Promise.reject(e);
         }
      );
   }, [handler]);

   /**
    * Converts useState to a useCallback
    */
   const setHandlerCallback = useCallback((
      newHandler: SubmitHandler<TReturn>) => {
         // setHandler will try to invoke the callback if passed as a function,
         // so wrap that in a function that ignores the oldState param.
         if(newHandler !== handler) { setHandler(_ => newHandler); }
      },
      [handler]
   );
   
   return {
      disabled: handler === false,
      submitVisible: handler !== undefined,
      canPerform: !!handler,
      loading,
      error,
      setHandler: setHandlerCallback,
      submit,
   }
}

export type ImportSubmitHandler = SubmitHandler<SourcedBookmarks>;
export type ImportPanelChildProps = ActionPanelChildProps<SourcedBookmarks>;
export type ImportPanelProps<C extends ImportPanelChildProps> = ActionPanelProps<SourcedBookmarks, C>;
export function ImportPanel<C extends ImportPanelChildProps>({
   children,
   ...rest
}: ImportPanelProps<C>): React.ReactElement<ImportPanelProps<C>> {
   const history = useHistory();
   const dispatch = useStoreDispatch();

   const setBookmarks = useMemo(() => (result: Promise<SourcedBookmarks>) => {
      result.then(
         (sourcedBookmarks) => {
            dispatch(actionCreators.loadBookmarks(sourcedBookmarks));
            history.push("/bookmarks");
            return Promise.resolve(true);
         },
         console.error
      );
   }, [history, dispatch]);

   return (
      <ActionPanel {...rest} onSubmitted={setBookmarks} >
         {children}
      </ActionPanel>
   );
}

export function makeImportForm<P extends ImportPanelChildProps>(Child: React.ComponentType<P>, header: string = "Import Bookmarks") {
      return ({...rest}: P) => (
         <ImportPanel header={header}>
            <Child {...rest}/>
         </ImportPanel>
      );
}

/**
 * Used by ActionPanel children to set their handlers.
 * @param submissionEnabled Should the user be able to submit the form
 * @param factory A factory that creates a submission handler
 * @param setHandler The setHandler sent from the container form
 * @param dependencies The values upon which the factory depends.
 */
export function useSubmitHandlerCreator(
   submissionEnabled: boolean, 
   setHandler: ((newHandler: ImportSubmitHandler)=>void)|undefined,
   factory: ImportSubmitHandler,
   dependencies: any[]
) {
   const handler = useMemo(() => factory, dependencies);
   console.log(setHandler, handler, submissionEnabled, ...dependencies);
   useEffect(() => {
      if(setHandler) {
         setHandler(submissionEnabled ? handler : false);
      }
   }, [setHandler, handler, submissionEnabled])
}