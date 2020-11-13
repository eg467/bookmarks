import { combineReducers } from 'redux';
import auth from './auth/reducer';
import bookmarks from './bookmarks/reducer';
const pocketReducer = combineReducers({
    auth, bookmarks
});
export default pocketReducer;
export const selectors = {
    auth: (state) => state.pocket.auth,
    bookmarks: (state) => state.pocket.bookmarks
};
