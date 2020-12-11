import * as React from "react";
import {useFirebaseAuth} from "../../api/firebase/firebase";
import {useState, useMemo} from "react";
import {Alert, AlertTitle} from "@material-ui/lab";
import {Button, createStyles, FormControlLabel, makeStyles, TextField, Link} from "@material-ui/core";
import {FirebaseAuthProps} from "./FirebaseAuth";
import {Theme} from "@material-ui/core/styles";
import {Wallpaper} from "@material-ui/icons";
import {SelectedButtonGroup} from "../common/SelectedButtonGroup";


