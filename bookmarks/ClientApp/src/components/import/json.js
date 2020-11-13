import React, { useState } from 'react';
const Json = (props) => {
    const [json, setJson] = useState("");
    const submitted = (e) => {
    };
    return (React.createElement("div", null,
        React.createElement("textarea", { onChange: e => setJson(e.target.value), cols: 50, rows: 25 }),
        React.createElement("div", null,
            React.createElement("button", { onClick: submitted }, "Submit"))));
};
