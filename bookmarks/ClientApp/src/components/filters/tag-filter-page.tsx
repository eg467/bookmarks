import React, { } from 'react';
import { ActionMeta, ValueType } from 'react-select';
import { connect } from 'react-redux';
import { AppState } from '../../redux/root/reducer';
import * as bookmarkActions from '../../redux/bookmarks/actions';
import { selectors as selectors } from "../../redux/bookmarks/reducer";
import { Dispatch } from 'redux';
import Select from 'react-select';

interface TagFiltersProps extends StateProps, DispatchProps {
}

type StateProps = {
    tags: string[];
    availableTags: Set<string>;
}

type DispatchProps = {
    setTags: (tags: string[]) => bookmarkActions.BookmarkAction;
}

export const FilterTagInput: React.FC<TagFiltersProps> = (props) => {
    const { availableTags, tags, setTags } = props;

    function handleChange(newValue: ValueType<{}>) {
        newValue = newValue === null ? [] : newValue;
        if (Array.isArray(newValue)) {
            const tags = newValue.map(v => v.value);
            setTags(tags);
        }
    }

    const toTagObj = (tags: string[]) => tags.map(o => ({ value: o, label: o }));

    const optionObjects = toTagObj([...availableTags].sort());
    const valueObjects = toTagObj(tags);

    return <Select
        isMulti
        isClearable={true}
        onChange={handleChange}
        value={valueObjects}
        options={optionObjects}
    />
};

export const AndTagFilter = connect(
    (state: AppState) => ({
        tags: selectors.selectAndFilter(state),
        availableTags: selectors.selectAllTags(state),
    }),
    (dispatch: Dispatch) => ({
        setTags: (tags: string[]) => dispatch(bookmarkActions.actionCreators.setAndFilter(tags)),
    })
)(FilterTagInput as any);

export const OrTagFilter = connect(
    (state: AppState) => ({
        tags: selectors.selectOrFilter(state),
        availableTags: selectors.selectAllTags(state),
    }),
    (dispatch: Dispatch) => ({
        setTags: (tags: string[]) => dispatch(bookmarkActions.actionCreators.setOrFilter(tags)),
    })
)(FilterTagInput as any);

export const NotTagFilter = connect(
    (state: AppState) => ({
        tags: selectors.selectNotFilter(state),
        availableTags: selectors.selectAllTags(state),
    }),
    (dispatch: Dispatch) => ({
        setTags: (tags: string[]) => dispatch(bookmarkActions.actionCreators.setNotFilter(tags)),
    })
)(FilterTagInput as any);

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