import React, {useState} from 'react';
import { connect, useSelector } from 'react-redux';
import { AppState } from '../../redux/root/reducer';
import * as bookmarkActions from '../../redux/bookmarks/actions';
import { selectors } from "../../redux/bookmarks/reducer";
import { Dispatch } from 'redux';
import {  selectAllTagOptions  } from '../tags/tag-types';
import Select, { SelectProps } from '../tags/Select';
import {
   Typography,
   TextField,
   makeStyles,
   Theme, createStyles, TextFieldProps, Button, Divider, debounce
} from "@material-ui/core";
import {useStoreDispatch, useStoreSelector} from "../../redux/store/configureStore";
import {actionCreators} from "../../redux/bookmarks/actions";
import { SelectedButtonGroup } from '../common/SelectedButtonGroup';

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

export const ContentFilter: React.FC<TextFieldProps> = ({...rest}) => {
    const searchTerm = useStoreSelector(state => state.bookmarks.filters.contentFilter);
    const dispatch = useStoreDispatch();
    const [value,setValue] = useState(searchTerm);
    
    const filter = (q: string) => dispatch(actionCreators.setContentFilter(q));
   const debouncedFilter = debounce(filter, 1000);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newValue = event.target.value;
       debouncedFilter(newValue);
        setValue(newValue);
    }
    return (
        <TextField
            label="Search titles, descriptions, and urls"
            value={value}
            onChange={handleChange}
            {...rest}
        />
    );
};

export type TernaryFilterProps = {
    value: boolean|undefined;
    onChange: (value: boolean|undefined) => any;
}
export const BinaryFilter: React.FC<TernaryFilterProps> = ({value, onChange}) => {
    const options = new Map([
       ["Show", true],
       ["Hide", false],
       ["All", undefined],
    ]);

    return (
      <SelectedButtonGroup
         options={options}
         defaultSelection={value}
         onSelectionChange={onChange}
      />
    );
};

export const ArchiveFilter: React.FC<{}> = () => {
    const value = useStoreSelector(state => state.bookmarks.filters.archived);
    const dispatch = useStoreDispatch();
    return (
        <BinaryFilter
            value={value}
            onChange={q => dispatch(actionCreators.setArchiveFilter(q))} />
    );
};

export const FavoriteFilter: React.FC<{}> = () => {
    const value = useStoreSelector(state => state.bookmarks.filters.favorite);
    const dispatch = useStoreDispatch();
    return (
        <BinaryFilter
            value={value}
            onChange={q => dispatch(actionCreators.setFavoriteFilter(q))} />
    );
};

export const SelectionFilter: React.FC<{}> = () => {
   const value = useStoreSelector(state => state.bookmarks.filters.selected);
   const dispatch = useStoreDispatch();
   return (
      <BinaryFilter
         value={value}
         onChange={selected => dispatch(actionCreators.setSelectedFilter(selected))} />
   );
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1, 1),
            "& > label > *": {
                margin: theme.spacing(1,1),
                display: "block"
            }
        },
        controlLabel: {
            "& MuiFormControlLabel-label": {
                padding: theme.spacing(1, 0)
            }    
        },
        fullWidth: {
            width: "100%"
        }
    })
);

export default function () {
    const classes = useStyles();
   const dispatch = useStoreDispatch();
   
   const handleClearFilters = () => {
      dispatch(actionCreators.clearFilters());
   }

   const header = (label: string) => (<Typography variant="h5">{label}</Typography>); 
    return (
        <div className={classes.root}>
            {header("Content")}
            <ContentFilter className={classes.fullWidth}  />

            <Divider />
            {header("Tags")}
            <label>
                <span>Include <b>all</b> of:</span>
                <AndTagFilter />
            </label>
            <label>
                <span>Include <b>at least one</b> of:</span>
                <OrTagFilter />
            </label>
            <label>
                <span>Include <b>None</b> of</span>
                <NotTagFilter />
            </label>

           <Divider />
            {header("Status")}

           <label>
              <span>Selected</span>
              <div>
                 <SelectionFilter />
              </div>
           </label>

           <label>
                <span>Archive</span>
                <div>
                    <ArchiveFilter />
                </div>
            </label>

            <label>
                <span>Favorites</span>
                <div>
                    <FavoriteFilter />
                </div>
            </label>
           
           <Divider />
           <Button
              onClick={handleClearFilters}   
              variant="outlined"
              color="secondary">Clear Filters</Button>
           
        </div>
    );
}