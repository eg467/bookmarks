import React, { Fragment, Props, PropsWithChildren, useState } from "react";
import clsx from "clsx";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green, grey } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Fab, { FabProps } from "@material-ui/core/Fab";
import CheckIcon from "@material-ui/icons/Check";
import ErrorIcon from "@material-ui/icons/Error";
import SaveIcon from "@material-ui/icons/Save";
import { PropTypes, SvgIcon, SvgIconTypeMap } from "@material-ui/core";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import { RequestStateType } from "../../redux/request-states/reducer";

type LoadingButtonStyleProps = {
    diameter?: number;
    thickness?: number;
    color?: string;
    backgroundColor?: string;
    foregroundColor?: string;
};

type OwnProps = {
    state?: RequestStateType,
} & LoadingButtonStyleProps;

type LoadingButtonProps = OwnProps & FabProps;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            alignItems: "center"
        },
        wrapper: {
            margin: theme.spacing(1),
            position: "relative",
        },
        fab: ({ diameter, foregroundColor, backgroundColor }: LoadingButtonStyleProps) => ({
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
        fabProgress: ({ diameter }: LoadingButtonStyleProps) => ({
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

const LoadingButton = ({
    state = RequestStateType.inactive,
    diameter = 50,
    thickness = 8,
    children, 
    foregroundColor,
    backgroundColor,
    ...rest
}: LoadingButtonProps) => {
    const classes = useStyles({ diameter, thickness, foregroundColor, backgroundColor }); 


    return (
        <div className={classes.wrapper}>
            <Fab
                {...rest}
                className={classes.fab}
                disabled={state !== RequestStateType.inactive}
            >
                {(state === RequestStateType.success) ? <CheckIcon /> : state === RequestStateType.error ? <ErrorIcon /> : children}
            </Fab>
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
export default LoadingButton;