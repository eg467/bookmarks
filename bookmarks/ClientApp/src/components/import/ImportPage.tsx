import React, {Fragment, ReactNode, useEffect, useRef} from "react";
import PocketImporter from "./PocketImporter";
import {Box, makeStyles, Tab, Tabs, Theme} from "@material-ui/core";
import JsonImporterForm from "./JsonImporter";
import {grey} from "@material-ui/core/colors";
import {BookmarkSource, BookmarkSourceType, selectors} from "../../redux/bookmarks/reducer";
import {useHistory} from "react-router";
import {useStoreSelector} from "../../redux/store/configureStore";
import { Link } from "react-router-dom";
import BrowserBookmarkImporterForm from "./BrowserBookmarkImporter";
import {VerticalTabPanel} from "../common/VerticalTabPanel";
import {ActionPanel, ImportPanelChildProps} from "./ActionPanel";
import FirebaseImporterForm from "./FirebaseImporter";

const useStyles = makeStyles((theme: Theme) => ({

}));

const ImportPage = (): JSX.Element => {
    const currentSource = useStoreSelector(selectors.selectBookmarkSource);
    const hasSource = currentSource.type !== BookmarkSourceType.none;
    
    const tabs = new Map<string, React.ReactElement<ImportPanelChildProps>>([
       ["Pocket", <PocketImporter/>],
       ["Raw JSON", <JsonImporterForm/>],
       ["Browser Bookmarks", <BrowserBookmarkImporterForm/>],
       ["Cloud", <FirebaseImporterForm/>],
    ]);
   
   return (
        <Fragment>
           {hasSource &&
              <p>
                  <Link to="/bookmarks">View existing bookmarks</Link>
              </p>
           } 
           <VerticalTabPanel tabPanels={tabs}/>
       </Fragment>
   );
};
export default ImportPage;
 
