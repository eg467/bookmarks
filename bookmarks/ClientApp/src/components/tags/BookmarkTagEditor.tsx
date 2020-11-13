import {
   Button,
   Chip,
   CircularProgress,
   Container,
   createStyles,
   Grow,
   IconButton,
   makeStyles,
   Popover,
   Theme,
} from "@material-ui/core";
import React, { useEffect, useState, useRef, Fragment } from "react";
import Select from "./Select";
import { OptionType, selectAllTagOptions } from "./tag-types";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import { connect, DispatchProp } from "react-redux";
import { AppState } from "../../redux/root/reducer";
import { StoreDispatch } from "../../redux/store/configureStore";
import {
   selectors as bmSelectors,
   standardizeTags,
} from "../../redux/bookmarks/reducer";
import {
   readRequestState,
   RequestStateType,
   RequestType,
   selectors as reqSelectors,
} from "../../redux/request-states/reducer";
import { actionCreators } from "../../redux/bookmarks/actions";
import { TagModification } from "../../api/bookmark-io";
import { Alert } from "reactstrap";
import Typography from "@material-ui/core/Typography";
import { Edit } from "@material-ui/icons";

export type OwnProps = {
   bookmarkId: string;
   isEditing?: boolean;
   values: string[];
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
   }),
);

const BookmarkTagEditor: React.FC<BookmarkTagEditorProps> = ({
   isEditing = false,
   values,
   canEdit,
   availableTags,
   requestState,
   removeTag,
   setTags,
}) => {
   const [editing, setEditing] = useState<boolean>(canEdit && isEditing);
   const [currentValues, setCurrentValues] = useState<string[]>(values);
   const popoverParent = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      setCurrentValues(values);
   }, [values]);

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
      !editing && canEdit ? () => removeTag(t) : undefined;

   function display(): JSX.Element {
      const tagChips = values.map((t) => (
         <Chip
            size="small"
            style={{ fontWeight: "bold", margin: "3px 2px" }}
            key={t}
            label={t}
            onDelete={makeRemoveTagHandler(t)}
         />
      ));

      if (canEdit) {
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
         <Fragment>
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
         </Fragment>
      );
   }

   function editingPopper(): JSX.Element | null {
      if (!editing) {
         return null;
      }
      return (
         <Popover
            open={editing}
            anchorEl={popoverParent.current}
            onClose={(): void => setEditing(false)}
            anchorOrigin={{
               vertical: "bottom",
               horizontal: "center",
            }}
            transformOrigin={{
               vertical: "top",
               horizontal: "center",
            }}
         >
            {editor()}
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            TEST
         </Popover>
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
   availableTags: selectAllTagOptions(state),
   canEdit: bmSelectors.selectCapabilities(state)("modifyTags"),
   requestState: readRequestState(
      reqSelectors.selectRequestStatesForBookmark(state, ownProps),
      RequestType.modifyTags,
   ),
});
type StateProps = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkTagEditor);
