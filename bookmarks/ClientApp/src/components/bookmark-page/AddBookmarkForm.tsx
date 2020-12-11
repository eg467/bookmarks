import {Button, createStyles, makeStyles, TextField, Theme, IconButton} from "@material-ui/core";
import React, {useState} from "react";
import {useStoreDispatch} from "../../redux/store/configureStore";
import {actionCreators} from "../../redux/bookmarks/actions";
import Select from "../tags/Select";
import { Alert, AlertTitle } from "@material-ui/lab";
import CloseIcon from "@material-ui/icons/Close";
import {isUrl} from "../../api/bookmark-io";

const useAddBookmarkFormStyles = makeStyles((theme: Theme) =>
   createStyles({
      formContainer: {
         width: "100%",
         display: "flex",
         justifyContent: "space-between",
         "& form": {
            display: "flex",
            alignItems: "center",
            "& > *": {
               margin: theme.spacing(1, 2)
            }
         }
      },
      tagEditor: {
         width: 300
      }
   }));


type FormState = {
   tags: string[],
   url: string,
   error: string,
   success: string
}

export type AddBookmarkFormProps = {
   onClose?: () => void;
};
export const AddBookmarkForm: React.FC<AddBookmarkFormProps> = ({onClose}) => {
   
   const [state, setState] = useState<FormState>({tags:[],url:"",error:"",success:""});
   const dispatch = useStoreDispatch();
   const classes = useAddBookmarkFormStyles();

   const handleUrlChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const url = event.target.value;
      setState(state => ({...state, url}));
   };
   
   const handleSetTags = (tags: string[]) => {
      setState(state => ({...state, tags}));
   }
   
   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();   
      if(!isUrl(state.url)) {
         setState(state => ({...state, error: "Invalid URL"}));
         return;
      }
      
      const {tags, url} = state;
      const action = actionCreators.add([{tags,url}])
      dispatch(action).then(
         x =>  setState({tags:[], url:"", error:"", success: `URL added: ${url}`}),
         err => setState(state => ({...state, error: err+""})));
   }

   const {error, success, tags} = state;
   
   return (
     <div>
         {error &&
         <Alert severity="error">
             <AlertTitle>Error</AlertTitle>
            {error}
         </Alert>
         }
         {success && <Alert severity="success">{success}</Alert>}
         <div className={classes.formContainer}>
            <form onSubmit={handleSubmit}>
               <TextField variant="outlined" size="medium" onChange={handleUrlChange} value={state.url} label="URL" />
               <Select className={classes.tagEditor} onChangedStrings={handleSetTags} valueStrings={tags} />
               <Button variant="contained" color="primary" type="submit">Add Bookmark</Button>
            </form>
            {onClose !== undefined &&
               <IconButton aria-label="close add bookmark form" onClick={onClose}>
                   <CloseIcon/>
               </IconButton>
            }
         </div>
     </div>
   );
};
export default AddBookmarkForm;