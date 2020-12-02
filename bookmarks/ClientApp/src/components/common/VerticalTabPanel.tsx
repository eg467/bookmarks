import React, {Fragment, useEffect, useRef} from "react";
import {Box, makeStyles, Tab, Tabs, Theme} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";
import {useHistory} from "react-router";
import {useStoreSelector} from "../../redux/store/configureStore";
import {BookmarkSource, BookmarkSourceType, selectors} from "../../redux/bookmarks/reducer";
import {Link} from "react-router-dom";
import PocketImporter from "../import/PocketImporter";
import {JsonImporter} from "../import/JsonImporter";
import {BrowserBookmarkImporter} from "../import/BrowserBookmarkImporter";

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

export type VerticalTabPanelProps = {
   tabPanels: Map<string, React.ReactNode>;
}
export const VerticalTabPanel: React.FC<VerticalTabPanelProps> = ({
   tabPanels
}) => {
   const classes = useStyles();
   const [tabIdx, setTabIdx] = React.useState(0);
   const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
      setTabIdx(newValue);
   };
   
   const tabs = Array.from(tabPanels.keys()).map((label,i) => (
      <Tab key={label} label={label} {...a11yProps(i)} />
   ));

   const panels = Array.from(tabPanels.entries()).map((contents,i) => (
      <TabPanel key={contents[0]} value={tabIdx} index={i}>
         {contents[1]}
      </TabPanel>
   ));
   
   return (
      <div className={classes.root} >
         <Tabs
            orientation="vertical"
            variant="scrollable"
            value={tabIdx}
            onChange={handleTabChange}
            aria-label="Vertical tabs example"
            className={classes.tabs}
         >
            {tabs}
         </Tabs>
         <div className={classes.tabContainer}>
            {panels}
         </div>
      </div>
   );
};