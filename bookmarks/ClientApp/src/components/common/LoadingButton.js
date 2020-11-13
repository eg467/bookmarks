import React from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import Fab from "@material-ui/core/Fab";
import CheckIcon from "@material-ui/icons/Check";
import ErrorIcon from "@material-ui/icons/Error";
import { RequestStateType } from "../../redux/request-states/reducer";
const useStyles = makeStyles((theme) => createStyles({
    root: {
        display: "flex",
        alignItems: "center"
    },
    wrapper: {
        margin: theme.spacing(1),
        position: "relative",
    },
    fab: ({ diameter, foregroundColor, backgroundColor }) => ({
        width: diameter,
        height: diameter,
        color: foregroundColor,
        backgroundColor
    }),
    buttonSuccess: {
        backgroundColor: green[500],
        "&:hover": {
            backgroundColor: green[700]
        }
    },
    fabProgress: ({ diameter }) => ({
        color: green[500],
        position: "absolute",
        top: `calc(50% - ${diameter}px / 2)`,
        left: `calc(50% - (${diameter}px / 2))`,
        zIndex: 1
    }),
    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12
    }
}));
const LoadingButton = ({ state = RequestStateType.inactive, diameter = 50, thickness = 8, children, foregroundColor, backgroundColor, ...rest }) => {
    const classes = useStyles({ diameter, thickness, foregroundColor, backgroundColor });
    return (React.createElement("div", { className: classes.wrapper },
        React.createElement(Fab, Object.assign({}, rest, { className: classes.fab, disabled: state !== RequestStateType.inactive }), (state === RequestStateType.success) ? React.createElement(CheckIcon, null) : state === RequestStateType.error ? React.createElement(ErrorIcon, null) : children),
        state === RequestStateType.pending && (React.createElement(CircularProgress, { disableShrink: false, thickness: thickness, size: diameter, className: classes.fabProgress }))));
};
export default LoadingButton;
