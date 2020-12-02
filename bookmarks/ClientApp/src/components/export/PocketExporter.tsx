import * as React from 'react';
import {BookmarkKeys} from "../../api/bookmark-io";
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";
import {BookmarkSourceType, selectors} from "../../redux/bookmarks/reducer";
import {Alert, AlertTitle} from "@material-ui/lab";
import {BookmarkData} from "../../redux/bookmarks/bookmarks";

export type PocketExporterProps = {
};
export const PocketExporter: React.FC<PocketExporterProps> = ({
}) => {
   const source = useStoreSelector(selectors.selectBookmarkSource);
   const dispatch = useStoreDispatch();
   
   if(source.type === BookmarkSourceType.pocket) {
      return (
         <Alert severity="warning">
            Your Pocket bookmarks are automatically synced while editing.
         </Alert>
      );
   }
   
   return (
      <div>
         
      </div>
   );
};
export default PocketExporter;