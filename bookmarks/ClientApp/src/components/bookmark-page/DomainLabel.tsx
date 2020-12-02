import * as React from 'react';
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import {green} from "@material-ui/core/colors";
import {getHostName} from "../../utils";

export type DomainLabelProps = {
   url: string;
   inline?: boolean;
};

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      root: ({inline}: Partial<DomainLabelProps>) => ({
         display: inline ? "inline" : "block",
         fontSize: ".8em",
         color: green["800"],
         fontStyle: "italic",
      })
   })
);

export const DomainLabel: React.FC<DomainLabelProps> = ({
   url,
   inline = true
}) => {
   const classes = useStyles({inline});
   return <div className={classes.root}>{getHostName(url)}</div>;
};

export default React.memo(DomainLabel);