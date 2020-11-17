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
    Checkbox,
    FormControlLabel,
    ButtonGroup,
    Button,
    makeStyles,
    Theme, createStyles, TextFieldProps
} from "@material-ui/core";
import {useStoreDispatch} from "../../redux/store/configureStore";
import {actionCreators} from "../../redux/bookmarks/actions";

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
    const searchTerm = useSelector((state: AppState) => state.bookmarks.filters.contentFilter);
    const dispatch = useStoreDispatch();
    const [value,setValue] = useState(searchTerm);
    
    const filter = (q: string) => dispatch(actionCreators.setContentFilter(q));
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newValue = event.target.value;
        setValue(newValue);
        filter(newValue);
    }
    return (
        <TextField
            label="Search titles, descriptions, and urls"
            defaultValue={searchTerm}
            onChange={handleChange}
            {...rest}
        />
    );
};

export type BinaryFilterProps = {
    value: boolean|undefined;
    onChange: (value: boolean|undefined) => any;
}
export const BinaryFilter: React.FC<BinaryFilterProps> = ({value, onChange}) => {
    const outlineType = (expectedValue: boolean|undefined) => value === expectedValue ? "contained" : "outlined";
    return (
        <ButtonGroup variant="outlined" size="small">
            <Button onClick={() => onChange(true)} variant={outlineType(true)}>Show</Button>
            <Button onClick={() => onChange(false)} variant={outlineType(false)}>Hide</Button>
            <Button onClick={() => onChange(undefined)} variant={outlineType(undefined)}>All</Button>
        </ButtonGroup>
    );
};

export const ArchiveFilter: React.FC<{}> = () => {
    const value = useSelector((state: AppState) => state.bookmarks.filters.archived);
    const dispatch = useStoreDispatch();
    return (
        <BinaryFilter
            value={value}
            onChange={q => dispatch(actionCreators.setArchiveFilter(q))} />
    );
};

export const FavoriteFilter: React.FC<{}> = () => {
    const value = useSelector((state: AppState) => state.bookmarks.filters.favorite);
    const dispatch = useStoreDispatch();
    return (
        <BinaryFilter
            value={value}
            onChange={q => dispatch(actionCreators.setFavoriteFilter(q))} />
    );
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1, 1),
            "& > label > *": {
                margin: theme.spacing(1,1)
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
    const header = (label: string) => (<Typography variant="h5">{label}</Typography>); 
    return (
        <div className={classes.root}>
            {header("Content")}
            <ContentFilter className={classes.fullWidth}  />

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

            {header("Status")}
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
        </div>
    );
}