import React, {PropsWithChildren, useState} from "react";
import {Button, Card, CardActions, CardContent, createStyles, makeStyles, Theme, Typography, CircularProgress} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";
import { useHistory } from "react-router-dom";
import {Alert, AlertTitle} from "@material-ui/lab";

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
   onImportBookmarks?: () => Promise<any> | void;
   additionalActions?: JSX.Element;
}>;

export const BookmarkImporterCard: React.FC<BookmarkImporterCardProps> = ({header, subheader, onImportBookmarks, additionalActions, children}) => {
   const history = useHistory();
   const classes = useBookmarkImporterCardPropsStyles();
   const [error, setError] = useState("");
   
   const [loading, setLoading] = useState(false);
   
   const handleImport = onImportBookmarks 
      ? () => {
         setLoading(true);
         return Promise.resolve(onImportBookmarks()).then(
            () => history.push("/bookmarks"),
            e => {
               setError(String(e));
               setLoading(false);
            })
      }
      : undefined;
   
   return (<Card>
         <CardContent>
            {header &&
            <Typography gutterBottom variant="h3" component="h3">
               {header}
            </Typography>
            }

            {error && 
               <Alert severity="error">
                  <AlertTitle>Error</AlertTitle>
                  {error}
               </Alert>
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
            {loading &&
               <CircularProgress />
            }
            {onImportBookmarks && !loading &&
               <Button size="large" variant="contained" color="primary" onClick={handleImport}>
                   Import Bookmarks
               </Button>
            }
         </CardActions>
      </Card>
   );
}
