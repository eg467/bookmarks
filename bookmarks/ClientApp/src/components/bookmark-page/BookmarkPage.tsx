import React, { Fragment } from "react";
import BookmarkFilters from "./BookmarkFilters";
import BookmarkBlocks from "./bookmark-blocks/bookmark-blocks";
import {useSelector} from "react-redux";
import {AppState} from "../../redux/root/reducer";
import {BookmarkSourceType} from "../../redux/bookmarks/reducer";
import { Redirect } from "react-router";
import ImportPage from "../import/ImportPage";
import MenuIcon from '@material-ui/icons/Menu';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import FilterListIcon from '@material-ui/icons/FilterList';
import SortIcon from '@material-ui/icons/Sort';
import SettingsIcon from '@material-ui/icons/Settings';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import {makeStyles, createStyles, Theme, useTheme, CssBaseline, AppBar, Toolbar, IconButton, Typography, Drawer, Divider, List, ListItem, ListItemIcon, Button} from "@material-ui/core";
import clsx from "clsx";
import { BookmarkLink } from "./BookmarkLink";
import {Link} from "react-router-dom"; 

export type DrawerContents = {
    component: React.ReactNode;
    title: string;
}

const drawerWidth = 360;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
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
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: drawerWidth,
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
        drawerTitle: {
                        
        },
        content: {
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

export const BookmarkPage: React.FC<{}> = () => {
    const bookmarkSourceType = useSelector((state: AppState) => state.bookmarks.source.type);
    const classes = useStyles();
    const theme = useTheme();
    const [drawerComponent, setDrawerComponent] = React.useState<DrawerContents|null>(null);
 
    if(bookmarkSourceType === BookmarkSourceType.none) {
        return <Redirect to="/import" />
    }

    const handleDrawerOpen = (contents: DrawerContents) => {
        setDrawerComponent(contents);
    };

    const handleDrawerClose = () => {
        setDrawerComponent(null);
    };
    
    const menuButton = (title: string, icon: React.ReactNode, componentCreator: () => React.ReactNode): React.ReactNode => {
        return (
            <Button
                variant="contained"
                color="default"
                className={classes.appBarButton}
                onClick={() => setDrawerComponent({
                    component: componentCreator(),
                    title: title
                })}
                startIcon={icon}
            >
                {title}
            </Button>
        );
    }
    
   return (
       
      <div className={classes.root}>
          <CssBaseline />

          <AppBar
              position="fixed"
              className={clsx(classes.appBar, {
                  [classes.appBarShift]: drawerComponent,
              })}
          >
              <Toolbar>
                  {/*
                  <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      onClick={handleDrawerOpen}
                      edge="start"
                      className={clsx(classes.menuButton, drawerComponent && classes.hide)}
                  >
                      <MenuIcon />
                  </IconButton>
                  */}

                  <Button color="default" component={RouterLink} to="/bookmarks">
                      <BookmarksIcon />
                  </Button>
                  {menuButton("Filters", <FilterListIcon />, () => <BookmarkFilters />,  )}
                  {menuButton("Sort", <SortIcon />, () => <BookmarkFilters />,  )}
              </Toolbar>
          </AppBar>
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
                      <Typography className={classes.drawerTitle} variant="h3">
                          {drawerComponent && drawerComponent.title}
                      </Typography>
                      <IconButton onClick={handleDrawerClose}>
                          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                      </IconButton>
                  </div>
                  <Divider />

                  {drawerComponent && drawerComponent.component}
              </Fragment>
          </Drawer>
          <main
              className={clsx(classes.content, {
                  [classes.contentShift]: !!drawerComponent,
              })}
          >
              <BookmarkBlocks />
          </main>
      </div>
   );
};

export default BookmarkPage;