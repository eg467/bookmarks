import React from "react";
import { Dispatch } from 'redux';
import * as bookmarkActions from '../../redux/bookmarks/actions';
import { ValueType } from "react-select";
import { selectors as selectors, standardizeTags } from "../../redux/bookmarks/reducer";
import { AppState } from "../../redux/root/reducer";
import { connect } from "react-redux";
import { fromOption, OptionType, selectAllTagOptions, toOption } from "./tag-types";
import { TagModification } from "../../api/bookmark-io";
import { StoreDispatch } from "../../redux/store/configureStore";
import Select, { SelectProps } from './Select';

type OwnProps = {
    bookmarkId: string;
}

export type BookmarkTagEditorProps = SelectProps & OwnProps;

export default connect(
    (state: AppState, { bookmarkId }: OwnProps) => ({
        valueStrings: selectors.selectBookmark(state, bookmarkId).tags,
        options: selectAllTagOptions(state),
    }),
    (dispatch: StoreDispatch, { bookmarkId }: OwnProps) => ({
        onChangeStrings: (tags: string[]) => dispatch(bookmarkActions.actionCreators.modifyTags({
            keys: bookmarkId,
            operation: TagModification.set,
            tags: standardizeTags(tags).join(",")
        }))
    })
)(Select);