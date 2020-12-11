import {SourcedBookmarks} from "../../redux/bookmarks/reducer";
import React, {useMemo} from "react";
import {useHistory} from "react-router-dom";
import {useStoreDispatch} from "../../redux/store/configureStore";
import {actionCreators} from "../../redux/bookmarks/actions";
import {ActionPanel, ActionPanelChildProps, ActionPanelProps, SubmitHandler} from "../import/ActionPanel";

export type ExportSubmitHandler = SubmitHandler<SourcedBookmarks>;
export type ExportPanelCommonControlsProps = {
   /**
    * True to export selected bookmarks, false to export all bookmarks
    */
   exportSelection: boolean;
   /**
    * Make the exported results the main data set after they're loaded.
    */
   redirectOnCompletion: boolean;
}

export type ExportPanelChildProps = ActionPanelChildProps<SourcedBookmarks> & { 
   commonProps: ExportPanelCommonControlsProps;
};

export type ExportPanelProps<C extends ExportPanelChildProps> = ActionPanelProps<SourcedBookmarks, C>;
export function ExportPanel<C extends ExportPanelChildProps>({
   children,
   ...rest
}: ExportPanelProps<C>): React.ReactElement<ExportPanelProps<C>> {
   const history = useHistory();
   const dispatch = useStoreDispatch();

   const setBookmarks = useMemo(() => async (result: Promise<SourcedBookmarks>) => {
      const sourcedBookmarks = await result;
   }, [history, dispatch]);

   return (
      <ActionPanel {...rest} onSubmitted={setBookmarks}  >
         {children}
      </ActionPanel>
   );
}

export function makeExportForm<P extends ExportPanelChildProps>(Child: React.ComponentType<P>, header: string = "Export Bookmarks") {
   return ({...props}: P) => (
      <ExportPanel header={header}>
         <Child {...props}/>
      </ExportPanel>
   ); 
}