import React, {Fragment, useEffect, useRef, useState} from "react";
import PocketImporter from "./PocketImporter";
import {Box, makeStyles, Tab, Tabs, Theme} from "@material-ui/core";
import {JsonImporter} from "./JsonImporter";
import {grey} from "@material-ui/core/colors";
import {useSelector} from "react-redux";
import {AppState} from "../../redux/root/reducer";
import {BookmarkSource, BookmarkSourceType} from "../../redux/bookmarks/reducer";
import {useHistory} from "react-router";

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}
function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}
function a11yProps(index: any) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex'
    },
    tabContainer: {
        width: "100%",
        position: "relative",
        right: 0,
        backgroundColor: grey["50"] //theme.palette.background.paper,
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
}));

const ImportPage = (): JSX.Element => {
    const classes = useStyles();
    const [tabIdx, setTabIdx] = React.useState(0);
    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabIdx(newValue);
    };
    const history = useHistory();
    const currentSource = useSelector((state: AppState) => state.bookmarks.source);
    
    // Used to detect the first change that originated from this component.
    const firstRun = useRef(true);
    useEffect(() => {
        if(!firstRun.current && currentSource.type !== BookmarkSourceType.none) {
            history.push("/bookmarks");
        }
        firstRun.current = false;
    }, [currentSource, history]);
    
   return (
        <Fragment>
            <div className={classes.root} >
               <Tabs
                   orientation="vertical"
                   variant="scrollable"
                   value={tabIdx}
                   onChange={handleTabChange}
                   aria-label="Vertical tabs example"
                   className={classes.tabs}
               >
                   <Tab label="Pocket" {...a11yProps(0)} />
                   <Tab label="Raw JSON" {...a11yProps(1)} />
               </Tabs>
                <div className={classes.tabContainer}>
                   <TabPanel value={tabIdx} index={0}>
                      <PocketImporter />
                   </TabPanel>
                   <TabPanel value={tabIdx} index={1}>
                       <JsonImporter />
                   </TabPanel>
                </div>
           </div>
       </Fragment>
   );
};
export default ImportPage;
 