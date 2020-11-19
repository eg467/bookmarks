
import constants from "../../constants/constants";
import PolicyIcon from '@material-ui/icons/Policy';
import Fab from "@material-ui/core/Fab";
import {RequestStateType} from "../../redux/request-states/reducer";
import CheckIcon from "@material-ui/icons/Check";
import ErrorIcon from "@material-ui/icons/Error";
import CircularProgress from "@material-ui/core/CircularProgress";
import React, { useEffect, useRef } from "react";
import {BookmarkActionFab} from "../bookmark-page/BookmarkActionFab";
const queryString = require('query-string');


export const VirusTotalButton: React.FC<{url: string}> = ({url}) => {
    // TODO: Use an actual link to avoid this bloat just to add some <a> properties.
    // This is for styling consistency with other buttons
    const handleClick = async () => {
        const apiUrl = `${constants.apiUrl}/virustotal/url?url=${queryString.stringify({url})}`;
        console.log(`Fetching: ${apiUrl}`);
        
        fetch(apiUrl, { method: "GET" })
           .then((res) => {
              console.log("TV link api response", res);
              const {status} = res;
              if(status < 200 || status >= 300) {
                 throw Error(`Failure code (${status} returned from API.`);
              }
              const returnedLink = res.text();
              console.log(`Redirecting to: ${returnedLink}`);
              return returnedLink;
           }) 
           .then(
              (link) => {
                 window.open(link, "_blank");
              },
              e => {
                  console.error(e);
                  alert("Error: " + String(e));
          });
    };
    
    return (
        <BookmarkActionFab onClick={handleClick}>
            <PolicyIcon />
        </BookmarkActionFab>
    );
};

export default VirusTotalButton;