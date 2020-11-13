import React from 'react';
import { connect } from 'react-redux';
import * as bookmarkActions from '../../redux/bookmarks/actions';
import { selectors as selectors } from "../../redux/bookmarks/reducer";
import { selectAllTagOptions } from './tag-types';
import Select from './Select';
export const AndTagFilter = connect((state) => ({
    valueStrings: selectors.selectAndFilter(state),
    options: selectAllTagOptions(state),
}), (dispatch) => ({
    onChangedStrings: (tags) => dispatch(bookmarkActions.actionCreators.setAndFilter(tags)),
}))(Select);
export const OrTagFilter = connect((state) => ({
    valueStrings: selectors.selectOrFilter(state),
    options: selectAllTagOptions(state),
}), (dispatch) => ({
    onChangedStrings: (tags) => dispatch(bookmarkActions.actionCreators.setOrFilter(tags)),
}))(Select);
export const NotTagFilter = connect((state) => ({
    valueStrings: selectors.selectNotFilter(state),
    options: selectAllTagOptions(state),
}), (dispatch) => ({
    onChangedStrings: (tags) => dispatch(bookmarkActions.actionCreators.setNotFilter(tags)),
}))(Select);
export default function () {
    return (React.createElement("div", null,
        React.createElement("h2", null, "Tags"),
        React.createElement("label", null,
            "Include ",
            React.createElement("em", null, "all"),
            " of these tags:",
            React.createElement(AndTagFilter, null)),
        React.createElement("label", null,
            "Include ",
            React.createElement("em", null, "at least one"),
            " of these tags:",
            React.createElement(OrTagFilter, null)),
        React.createElement("label", null,
            "Include ",
            React.createElement("em", null, "None"),
            " of these tags",
            React.createElement(NotTagFilter, null))));
}
