import Fab, {FabProps} from "@material-ui/core/Fab";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {RequestStateType} from "../../redux/request-states/reducer";
import CheckIcon from "@material-ui/icons/Check";
import ErrorIcon from "@material-ui/icons/Error";
import React from "react";
import {colors} from "@material-ui/core";
import {blue} from "@material-ui/core/colors";

export type BookmarkActionFabStyleProps = {
    diameter?: number;
    backgroundColor?: string;
    foregroundColor?: string;
};

export type BookmarkActionFabProps = FabProps & BookmarkActionFabStyleProps;

export const useBookmarkActionFabStyles = makeStyles((theme: Theme) =>
    createStyles({
        fab: ({ diameter, foregroundColor, backgroundColor }: BookmarkActionFabStyleProps) => ({
            width: diameter,
            height: diameter,
            color: foregroundColor,
            backgroundColor
        }),

    })); 

export const BookmarkActionFab: React.FC<BookmarkActionFabProps> = (props) => {
    const {
        diameter = 40,
        backgroundColor = colors.common.white,
        foregroundColor = blue[500],
        children,
        ...rest
    } = props;
    const classes = useBookmarkActionFabStyles({diameter,foregroundColor,backgroundColor});
    return <Fab {...rest} className={classes.fab}>{children}</Fab>;
};