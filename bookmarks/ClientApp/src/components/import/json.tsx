import React, { createContext, Fragment, PropsWithChildren, useState } from 'react';
import { useHistory } from "react-router-dom";
import { BookmarkPersister } from '../../api/bookmark-io';

const Json: React.FC<{}> = (props) => {
    const [json, setJson] = useState<string>("");

    const submitted = (e: React.MouseEvent<HTMLButtonElement>) => {
    }

    return (
        <div>
            <textarea onChange={e => setJson(e.target.value)} cols={50} rows={25} />
            <div>
                <button onClick={submitted}>Submit</button>
            </div>
        </div>
    );
};