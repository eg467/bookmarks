import {Checkbox, FormControlLabel} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import React, {PropsWithChildren} from "react";
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";
import {useSelector} from "react-redux";
import {AppState} from "../../redux/root/reducer";
import { selectors } from "../../redux/bookmarks/reducer";
import {actionCreators} from "../../redux/bookmarks/actions";

export type SelectBookmarkProps = PropsWithChildren<{
   bookmarkId: string;
}>;

export const SelectBookmark: React.FC<SelectBookmarkProps> = ({
   bookmarkId,
   children
}) => {
   const dispatch = useStoreDispatch();
   // noinspection PointlessBooleanExpressionJS
   const selected = !!useStoreSelector(selectors.selectSelectedBookmarks)[bookmarkId];
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => 
      dispatch(actionCreators.select(e.target.checked, bookmarkId));
   const checkbox = <Checkbox checked={selected} onChange={handleChange} />;
   return <FormControlLabel control={checkbox} label={children} />
};
export default SelectBookmark;