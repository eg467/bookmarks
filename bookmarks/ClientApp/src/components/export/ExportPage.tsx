import React, {Fragment, ReactNode, useEffect, useRef, useState} from "react";
import {Box, makeStyles, Tab, Tabs, Theme} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";
import {BookmarkSource, BookmarkSourceType, selectors} from "../../redux/bookmarks/reducer";
import {useHistory} from "react-router";
import {useStoreSelector} from "../../redux/store/configureStore";
import { Link } from "react-router-dom";
import {VerticalTabPanel} from "../common/VerticalTabPanel";
import {SelectedButtonGroup} from "../common/SelectedButtonGroup";

const useStyles = makeStyles((theme: Theme) => ({

}));

const ExportPage = (): JSX.Element => {
   const classes = useStyles();
   const history = useHistory();
   const currentSource = useStoreSelector(selectors.selectBookmarkSource);
   const bookmarks = useStoreSelector(selectors.selectBookmarkList);
   const selectedIds = useStoreSelector(selectors.selectSelectedBookmarkIds);
   const hasSource = (source: BookmarkSource) => source.type !== BookmarkSourceType.none;
   
   const [exportSelected, setExportSelected] = useState(true)
   
   
   const selectionOptions = new Map([["selected", true],["all",false]])
   

   const tabs = new Map<string, React.ReactNode>([
      ["Pocket", <div/>],
      //["Raw JSON", <JsonImporter/>],
      //["Browser Bookmarks", <BrowserBookmarkImporter/>],
   ]);

   return (
      <Fragment>
         {hasSource(currentSource) &&
         <p>
             <Link to="/bookmarks">View existing bookmarks</Link>
         </p>
         }

         <SelectedButtonGroup<boolean>
            options={selectionOptions}
            defaultSelection={exportSelected}
            onSelectionChange={setExportSelected}
         />
         
         <VerticalTabPanel tabPanels={tabs}/>
      </Fragment>
   );
};
export default ExportPage;
 
