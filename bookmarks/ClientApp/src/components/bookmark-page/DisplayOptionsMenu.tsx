import React from "react";
import {
   Checkbox,
   createStyles,
   FormControl,
   FormControlLabel,
   Select,
   Switch,
   Theme,
   Typography
} from "@material-ui/core";
import {BookmarkDisplayElements, BookmarkLayout, selectors} from "../../redux/options/reducer";
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";
import {actionCreators} from "../../redux/options/actions";
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      formControl: {
         margin: theme.spacing(1),
         minWidth: 120,
         maxWidth: 300,
      },
      chips: {
         display: 'flex',
         flexWrap: 'wrap',
      },
      chip: {
         margin: 2,
      },
      noLabel: {
         marginTop: theme.spacing(3),
      },
   }),
);



export const DisplayOptionsMenu: React.FC<{}> = () => {
   const shouldShow = useStoreSelector(selectors.selectDisplayElementQuery);
   const layout = useStoreSelector(selectors.selectLayout);
   const dispatch = useStoreDispatch();
   const classes = useStyles();
   const setShouldShow = (element: BookmarkDisplayElements) => 
      (event: React.ChangeEvent<HTMLInputElement>) =>
         dispatch(actionCreators.toggleDisplayElement(element, event.target.checked));
   
   const displayElementCheckbox = (element: BookmarkDisplayElements) => (
      <Switch
         checked={shouldShow(element)}
         onChange={setShouldShow(element)}
         color="primary"
      />
   );
   
   const displayElementSelector = (elements: BookmarkDisplayElements) => {
      return (
         <FormControl key={BookmarkDisplayElements[elements]} className={classes.formControl}>
            <FormControlLabel
               control={displayElementCheckbox(elements)}
               label={`Show ${BookmarkDisplayElements[elements]}`}
            />
         </FormControl>
      );
   }
   
   const togglableElements:BookmarkDisplayElements[] =
      [BookmarkDisplayElements.favicon, BookmarkDisplayElements.title, BookmarkDisplayElements.tags, BookmarkDisplayElements.description, BookmarkDisplayElements.image];
   
   
   const handleLayoutChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
      const layout = event.target.value as BookmarkLayout;
      dispatch(actionCreators.setLayout(layout));
   };

   const createLayoutOption = (layout: BookmarkLayout) => 
      <option key={layout} value={layout}>{layout}</option>;
   
   return (
   <div>
      <Typography variant="h6">Display Elements</Typography>
      {togglableElements.map(displayElementSelector)}

      <Typography variant="h6">Layout</Typography>
      <FormControl className={classes.formControl}>
         <Select
            native
            value={layout}
            onChange={handleLayoutChange}
         >
            {(["masonry", "list"] as BookmarkLayout[]).map(createLayoutOption)}
         </Select>
      </FormControl>

   </div>
   );
};












