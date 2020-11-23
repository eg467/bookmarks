import {
   Button,
   Chip,
   CircularProgress,
   createStyles,
   IconButton,
   makeStyles,
   Popover,
   Theme,
   Modal,
   Typography,
   TextField,
} from "@material-ui/core";
import React, {Fragment, useEffect, useRef, useState} from "react";
import Select from "./Select";
import {selectAllTagOptions} from "./tag-types";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import {connect} from "react-redux";
import {AppState} from "../../redux/root/reducer";
import {StoreDispatch, useStoreDispatch} from "../../redux/store/configureStore";
import {BookmarkDisplayElements, selectors as optionSelectors} from "../../redux/options/reducer";
import {selectors as bmSelectors, standardizeTags,} from "../../redux/bookmarks/reducer";
import {
   readRequestState,
   RequestStateType,
   RequestType,
   selectors as reqSelectors,
} from "../../redux/request-states/reducer";
import {actionCreators} from "../../redux/bookmarks/actions";
import {BookmarkSeed, TagModification, toArray} from "../../api/bookmark-io";
import {Alert} from "reactstrap";

export type OwnProps = {
   bookmarkId: string;
   isEditing?: boolean;
};

export type BookmarkTagEditorProps = OwnProps & DispatchProps & StateProps;

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      submitContainer: {
         display: "flex",
      },
      button: {
         margin: theme.spacing(1),
      },
      tagDropdown: {
      },
      tag: {
         fontWeight: "bold",
         margin: theme.spacing(.2),
         padding: ".5em .25em"
      },
      modal: {
         position: "absolute",
            width: 400,
            backgroundColor: theme.palette.background.paper,
            border: "2px solid #000",
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
      }
   }),
);

const BookmarkTagEditor: React.FC<BookmarkTagEditorProps> = ({
   isEditing = false,
   bookmark,
   readonly,
   availableTags,
   requestState,
   removeTag,
   setTags,
}) => {
   const {tags,excerpt,title,url} = bookmark;
   const [editing, setEditing] = useState<boolean>(readonly && isEditing);
   const [currentValues, setCurrentValues] = useState<string[]>(tags);
   const popoverParent = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
       setCurrentValues(tags);
    }, [tags]);

   const classes = useStyles();

   const { state, error } = requestState;

   if (editing && state === RequestStateType.success) {
      setEditing(false);
   }

   function handleSaved(): void {
      const standardizedTags = standardizeTags(currentValues).join();
      setTags(standardizedTags).then(() => setEditing(false));
   }

   const makeRemoveTagHandler = (t: string) =>
      (!editing && !readonly) ? () => removeTag(t) : undefined;

   function display(): JSX.Element {
      const tagChips = tags.map((t) => (
         <Chip
            size="small"
            variant="outlined"
            className={classes.tag}
            key={t}
            label={t}
            onDelete={makeRemoveTagHandler(t)}
         />
      ));

      if (!readonly) {
         const editTagsButton = (
            <label
               key="<edit tag button>"
               onClick={(_) => setEditing(true)}
               htmlFor="icon-button-edit"
            >
               <IconButton
                  size="small"
                  color="primary"
                  disabled={editing}
                  aria-label="Edit bookmark tags"
                  component="span"
               >
                  <EditIcon />
               </IconButton>
            </label>
         );
         tagChips.push(editTagsButton);
      }

      return <Fragment> {tagChips} </Fragment>;
   }

   function editor(): JSX.Element {
      return (
         <div className={classes.modal}>
            <Typography variant="h4">{title}</Typography>
            <Typography variant="h5">{url}</Typography>
            <Typography variant="body1">{excerpt}</Typography>
            <Select
               onChangedStrings={setCurrentValues}
               canAdd={true}
               valueStrings={currentValues}
               options={availableTags}
            />
            <div className={classes.submitContainer}>
               <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  className={classes.button}
                  onClick={handleSaved}
                  disabled={state === RequestStateType.pending}
                  startIcon={<SaveIcon />}
               >
                  Save
               </Button>

               {state === RequestStateType.pending && (
                  <CircularProgress size="small" />
               )}

               <Button
                  color="secondary"
                  size="small"
                  disabled={state === RequestStateType.pending}
                  onClick={(): void => setEditing(false)}
               >
                  Cancel
               </Button>
            </div>
         </div>
      );
   }

   function editingPopper(): JSX.Element | null {
      if (!editing) {
         return null;
      }
      return (
         <Modal
            open={editing}
            onClose={(): void => setEditing(false)}
         >
            {editor()}
         </Modal>
      );
   }

   return (
      <div>
         <div ref={popoverParent}>{display()}</div>
         {editingPopper()}
         {error && <Alert severity="error">{error}</Alert>}
      </div>
   );
};

const mapDispatchToProps = (dispatch: StoreDispatch, ownProps: OwnProps) => ({
   removeTag: (tag: string) =>
      dispatch(
         actionCreators.modifyTags({
            keys: ownProps.bookmarkId,
            operation: TagModification.remove,
            tags: tag,
         }),
      ),
   setTags: (tags: string) =>
      dispatch(
         actionCreators.modifyTags({
            keys: ownProps.bookmarkId,
            operation: TagModification.set,
            tags,
         }),
      ),
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

console.log(reqSelectors.selectRequestStatesForBookmark);

const mapStateToProps = (state: AppState, ownProps: OwnProps) => ({
   bookmark: bmSelectors.selectBookmark(state, ownProps.bookmarkId),
   availableTags: selectAllTagOptions(state),
   readonly: !bmSelectors.selectCapabilities(state)("modifyTags") 
      || !optionSelectors.selectDisplayElementQuery(state)(BookmarkDisplayElements.edit),
   requestState: readRequestState(
      reqSelectors.selectRequestStatesForBookmark(state, ownProps),
      RequestType.modifyTags,
   ),
});
type StateProps = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkTagEditor);


