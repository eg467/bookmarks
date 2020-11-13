import * as bookmarkActions from '../../redux/bookmarks/actions';
import { selectors as selectors, standardizeTags } from "../../redux/bookmarks/reducer";
import { connect } from "react-redux";
import { selectAllTagOptions } from "./tag-types";
import { TagModification } from "../../api/bookmark-io";
import Select from './Select';
export default connect((state, { bookmarkId }) => ({
    valueStrings: selectors.selectBookmark(state, bookmarkId).tags,
    options: selectAllTagOptions(state),
}), (dispatch, { bookmarkId }) => ({
    onChangeStrings: (tags) => dispatch(bookmarkActions.actionCreators.modifyTags({
        keys: bookmarkId,
        operation: TagModification.set,
        tags: standardizeTags(tags).join(",")
    }))
}))(Select);
