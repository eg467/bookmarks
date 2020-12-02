import React, {Fragment, useState} from "react";
import FilterMenu from "./FilterMenu";
import BookmarkBlocks from "./BookmarkBlocks";
import {BookmarkSourceType} from "../../redux/bookmarks/reducer";
import {Redirect} from "react-router";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import FilterListIcon from '@material-ui/icons/FilterList';
import SelectionsIcon from '@material-ui/icons/DoneAll';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SortIcon from '@material-ui/icons/Sort';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import {Link as RouterLink} from 'react-router-dom';
import {
   AppBar,
   Button,
   createStyles,
   CssBaseline, Drawer,
   FormControlLabel,
   makeStyles,
   Switch,
   Theme,
   useTheme,
   Typography,
   Divider,
   IconButton,
   Toolbar,
   Box
} from "@material-ui/core";
import clsx from "clsx";
import Sort from "./Sort";
import {SelectionMenu} from "../selection/SelectionMenu";
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";
import {BookmarkRows} from "./BookmarkRows";
import {DisplayOptionsMenu} from "./DisplayOptionsMenu";
import {BookmarkDisplayElements, selectors as optionSelectors} from "../../redux/options/reducer";
import {green, common} from "@material-ui/core/colors";
import {actionCreators} from "../../redux/options/actions";
import AddBookmarkForm from "./AddBookmarkForm";
import {BookmarkGrid} from "./BookmarkGrid";

export type DrawerContents = {
   component: React.ReactNode;
   title: string;
}

const drawerWidth = 360;

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      root: {},
      panes: {
         display: 'flex',
      },
      appBar: {
         transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
         }),

      },
      appBarButton: {
         margin: theme.spacing(1),
      },
      appBarShift: {
         width: `calc(100% - ${drawerWidth}px)`,
         marginLeft: drawerWidth,
         transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
         }),
      },
      menuButton: {
         marginRight: theme.spacing(2),
      },
      hide: {
         display: 'none',
      },
      activeMenuButton: {
         color: green[600],
         backgroundColor: common.white
      },
      drawer: {
         width: drawerWidth,
         flexShrink: 0,
      },
      drawerPaper: {
         width: drawerWidth,
      },
      addBookmarkFormContainer: {
         margin: theme.spacing(1),
         backgroundColor: theme.palette.background.paper,
         border: "1px solid black",
         borderRadius: 3

      },
      drawerHeader: {
         display: 'flex',
         alignItems: 'center',
         padding: theme.spacing(0, 1),
         // necessary for content to be below app bar
         ...theme.mixins.toolbar,
         //justifyContent: 'flex-end',
         justifyContent: 'space-between',
      },
      drawerTitle: {},
      drawerContent: {
         padding: theme.spacing(1),
      },
      contentContainer: {
         flexGrow: 1,
         padding: theme.spacing(3),
         transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
         }),
         marginLeft: -drawerWidth,
      },
      contentShift: {
         transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
         }),
         marginLeft: 0,
      },
   }),
);

export const BookmarkLayout: React.FC<{}> = () => {
   const options = useStoreSelector(state => state.options);
   switch (options.layout) {
      case "list":
         return <BookmarkGrid/>;
      default:
         return <BookmarkBlocks/>;
   }
}

export const BookmarkPage: React.FC<{}> = () => {
   const bookmarkSourceType = useStoreSelector(state => state.bookmarks.source.type);
   const editMode = useStoreSelector(optionSelectors.selectDisplayElementQuery)(BookmarkDisplayElements.edit)
   const dispatch = useStoreDispatch();
   const classes = useStyles();
   const theme = useTheme();
   const [drawerComponent, setDrawerComponent] = React.useState<DrawerContents | null>(null);

   if (bookmarkSourceType === BookmarkSourceType.none) {
      return <Redirect to="/import"/>
   }

   const handleDrawerClose = () => {
      setDrawerComponent(null);
   };

   const handleEditModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const action = actionCreators.toggleDisplayElement(
         BookmarkDisplayElements.edit,
         event.target.checked);
      dispatch(action);
   }

   const menuButton = (title: string, icon: React.ReactNode, componentCreator: () => React.ReactNode): React.ReactNode => {
      const isSelected = drawerComponent && drawerComponent.title === title;
      const classname = clsx({[classes.appBarButton]: true, [classes.activeMenuButton]: isSelected})


      return (
         <Button
            variant="contained"
            color="default"
            className={classname}
            onClick={() => {
               if (isSelected) {
                  handleDrawerClose();
               } else {
                  setDrawerComponent({
                     component: componentCreator(),
                     title: title
                  });
               }
            }}
            startIcon={icon}
         >
            <div>{title}</div>
         </Button>
      );
   }

   const editModeSwitch = (
      <FormControlLabel
         control={
            <Switch
               checked={editMode}
               onChange={handleEditModeChange}
               color="secondary"
            />
         }
         label="Edit"
      />
   );

   return (
      <div className={classes.root}>
         <CssBaseline/>
         <AppBar
            position="fixed"
            className={clsx(classes.appBar, {
               [classes.appBarShift]: drawerComponent,
            })}
         >
            <Toolbar>
               <IconButton color="default" aria-label="Import bookmarks" component={RouterLink} to="/import" title="Import bookmarks">
                  <CloudDownloadIcon/>
               </IconButton>
               <IconButton color="default" aria-label="Export bookmarks" component={RouterLink} to="/export" title="Export bookmarks">
                  <CloudUploadIcon/>
               </IconButton>

               {editModeSwitch}
               {menuButton("Filters", <FilterListIcon/>, () => <FilterMenu/>,)}
               {menuButton("Sort", <SortIcon/>, () => <Sort/>,)}
               {menuButton("Selection", <SelectionsIcon/>, () => <SelectionMenu/>,)}
               {menuButton("Options", <SettingsApplicationsIcon/>, () => <DisplayOptionsMenu/>,)}
            </Toolbar>
         </AppBar>
         <Toolbar />

         <div className={classes.panes}>
            <Drawer
               className={classes.drawer}
               variant="persistent"
               anchor="left"
               open={!!drawerComponent}
               classes={{
                  paper: classes.drawerPaper,
               }}
            >
               <Fragment>
                  <div className={classes.drawerHeader}>
                     <Typography className={classes.drawerTitle} variant="h5">
                        {drawerComponent && drawerComponent.title}
                     </Typography>
                     <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
                     </IconButton>
                  </div>
                  <Divider/>
                  <div className={classes.drawerContent}>
                     {drawerComponent && drawerComponent.component}
                  </div>
               </Fragment>
            </Drawer>
            <main
               className={clsx(classes.contentContainer, {
                  [classes.contentShift]: !!drawerComponent,
               })}
            >

               <Box className={classes.addBookmarkFormContainer}>
                  <AddBookmarkForm/>
               </Box>
               <BookmarkLayout/>
            </main>
         </div>
      </div>
   );
};

export default BookmarkPage;