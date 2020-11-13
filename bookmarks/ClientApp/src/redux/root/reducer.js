import { combineReducers } from "redux";
import pocket from "../pocket/reducer";
import bookmarks from "../bookmarks/reducer";
const rootReducer = combineReducers({ pocket, bookmarks });
export const selectors = {
    selectState: (state) => state,
    selectPocketState: (state) => state.pocket,
    selectBookmarksState: (state) => state.bookmarks,
};
export default rootReducer;
