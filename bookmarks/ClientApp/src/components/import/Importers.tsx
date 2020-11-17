import React, {PropsWithChildren} from "react";
import Alert from "@material-ui/lab/Alert";
import {Button, Card, CardActions, CardContent, createStyles, makeStyles, Theme, Typography} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";

export const ImportationError = ({
   message = "There was an error parsing your bookmarks.",
}: {
   message?: string;
}): JSX.Element | null =>
   message ? <Alert severity="error">{message}</Alert> : null;

const useBookmarkImporterCardPropsStyles = makeStyles((theme: Theme) =>
   createStyles({
      root: {
         width: '50%',
         backgroundColor: theme.palette.background.paper,
         //display: "inline-block",

         "& a": {
            color: grey[800]
         }
      },
      nested: {
         paddingLeft: theme.spacing(4),
      },
   }),
);


export type BookmarkImporterCardProps = PropsWithChildren<{
   header: string;
   subheader?: string;
   onImportBookmarks?: () => void;
   additionalActions?: JSX.Element;
}>;

export const BookmarkImporterCard: React.FC<BookmarkImporterCardProps> = ({header, subheader, onImportBookmarks, additionalActions, children}) => {
   const classes = useBookmarkImporterCardPropsStyles();
   return (<Card>
         <CardContent>
            {header &&
            <Typography gutterBottom variant="h3" component="h3">
               {header}
            </Typography>
            }

            {subheader &&
            <Typography gutterBottom variant="subtitle1" component="h4">
               {subheader}
            </Typography>
            }

            {children}
         </CardContent>
         <CardActions>
            {additionalActions}
            {onImportBookmarks &&
               <Button size="large" color="primary" onClick={onImportBookmarks}>
                   Import Bookmarks
               </Button>
            }
         </CardActions>
      </Card>
   );
}
