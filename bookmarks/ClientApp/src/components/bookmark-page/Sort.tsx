import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/root/reducer';
import { SelectProps } from '../tags/Select';
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
import {actionCreators, ActionType, SortBookmarksAction} from "../../redux/bookmarks/actions";
import {SelectedButtonGroup} from "../common/SelectedButtonGroup";
import {BookmarkSortField} from "../../redux/bookmarks/bookmarks";

type PartialProps = Partial<SelectProps>;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1, 1),
            "& > label > *": {
                display: "block",
                margin: theme.spacing(1, 1)
            }
        }
    })
);

export type SortFieldProps = {
    value: BookmarkSortField;
    onChange: (value: BookmarkSortField) => any;
}
export const SortField: React.FC<SortFieldProps> = ({value, onChange}) => {
    const options = new Map(
        Object.values(BookmarkSortField)
            .map(v => Number(v))
            .filter(v => !isNaN(v))
            .map((v: number) => [BookmarkSortField[v] as string, v as BookmarkSortField])
    );

    return (<SelectedButtonGroup
        options={options}
        defaultValue={value}
        onChange={onChange}
    />);
};

export type SortOrderProps = {
    value: boolean;
    onChange: (ascending: boolean) => any;
}
export const SortOrder: React.FC<SortOrderProps> = ({value, onChange}) => {
    const options = new Map([
        ["Ascending", true],
        ["Descending", false]
    ]);

    return (<SelectedButtonGroup
        options={options}
        defaultValue={value}
        onChange={onChange}
    />);
};

export default function () {
    const classes = useStyles();
    const storedSort = useSelector((state: AppState)=>state.bookmarks.sort);
    const dispatch = useStoreDispatch();
    
    const setOrder = (ascending: boolean) => dispatch(actionCreators.sortBookmarks(storedSort.field, ascending))
    const setField = (field: BookmarkSortField) => dispatch(actionCreators.sortBookmarks(field, storedSort.ascending))
    
    const header = (label: string) => (<Typography variant="h5">{label}</Typography>);
    return (
        <div className={classes.root}>
            <label>
                <span>Sort Field</span>
                <SortField value={storedSort.field} onChange={setField} />
            </label>
            <label>
                <span>Sort Order</span>
                <SortOrder value={storedSort.ascending} onChange={setOrder} />
            </label>
        </div>
    );
}