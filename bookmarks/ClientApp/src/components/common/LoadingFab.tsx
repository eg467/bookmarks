import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import { FabProps } from "@material-ui/core/Fab";
import CheckIcon from "@material-ui/icons/Check";
import ErrorIcon from "@material-ui/icons/Error";
import { RequestStateType } from "../../redux/request-states/reducer";
import {BookmarkActionFab} from "../bookmark-page/BookmarkActionFab";

type LoadingFabStyleProps = {
    diameter?: number;
    thickness?: number;
    color?: string;
    backgroundColor?: string;
    foregroundColor?: string;
};

type OwnProps = LoadingFabStyleProps & { state?: RequestStateType };
type LoadingFabProps = OwnProps & FabProps;
    
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            alignItems: "center"
        },
        container2: {
            position: "relative",
        },
        buttonSuccess: {
            backgroundColor: green[500],
            "&:hover": {
                backgroundColor: green[700]
            }
        },
        fabProgress: ({ diameter }: LoadingFabStyleProps) => ({
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
    })
);

const LoadingFab = ({
    state = RequestStateType.inactive,
    diameter = 50,
    thickness = 8,
    children, 
    foregroundColor,
    backgroundColor,
    ...rest
}: LoadingFabProps) => {
    const classes = useStyles({ diameter, thickness, foregroundColor, backgroundColor }); 


    return (
        <div className={classes.container2}>
            <BookmarkActionFab {...rest}>
                {(state === RequestStateType.success) ? <CheckIcon /> : state === RequestStateType.error ? <ErrorIcon /> : children}
            </BookmarkActionFab>
            {state === RequestStateType.pending && (
                <CircularProgress
                    disableShrink={false}
                    thickness={thickness}
                    size={diameter}
                    className={classes.fabProgress}
                />
            )}
        </div>
    );
}
export default LoadingFab;