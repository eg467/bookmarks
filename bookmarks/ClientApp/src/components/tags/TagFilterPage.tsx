import React, { } from 'react';
import { ActionMeta, OptionsType, ValueType } from 'react-select';
import { connect } from 'react-redux';
import { AppState } from '../../redux/root/reducer';
import * as bookmarkActions from '../../redux/bookmarks/actions';
import { selectors as selectors } from "../../redux/bookmarks/reducer";
import { Dispatch } from 'redux';
import { createSelector } from 'reselect';
import { fromOption, OptionType, selectAllTagOptions, toOption } from './tag-types';
import Select, { SelectProps } from './Select';

type PartialProps = Partial<SelectProps>;

export const AndTagFilter = connect(
    (state: AppState): PartialProps => ({
        valueStrings: selectors.selectAndFilter(state),
        options: selectAllTagOptions(state),
    }),
    (dispatch: Dispatch): PartialProps => ({
        onChangedStrings: (tags: string[]) => dispatch(bookmarkActions.actionCreators.setAndFilter(tags)),
    })
)(Select);
export const OrTagFilter = connect(
    (state: AppState): PartialProps => ({
        valueStrings: selectors.selectOrFilter(state),
        options: selectAllTagOptions(state),
    }),
    (dispatch: Dispatch): PartialProps => ({
        onChangedStrings: (tags: string[]) => dispatch(bookmarkActions.actionCreators.setOrFilter(tags)),
    })
)(Select);
export const NotTagFilter = connect(
    (state: AppState): PartialProps => ({
        valueStrings: selectors.selectNotFilter(state),
        options: selectAllTagOptions(state),
    }),
    (dispatch: Dispatch): PartialProps => ({
        onChangedStrings: (tags: string[]) => dispatch(bookmarkActions.actionCreators.setNotFilter(tags)),
    })
)(Select);

export default function () {
    return (
        <div>
            <h2>Tags</h2>
            <label>
                Include <em>all</em> of these tags:
            <AndTagFilter />
            </label>
            <label>
                Include <em>at least one</em> of these tags:
            <OrTagFilter />
            </label>
            <label>
                Include <em>None</em> of these tags
            <NotTagFilter />
            </label>
        </div>
    );
}