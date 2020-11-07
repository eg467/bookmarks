import React from "react";

//import classNames from "classnames";
import Select from "react-select";


const options = [
   { label: 'Chocolate' },
   { label: 'Strawberry' },
   { label: 'Vanilla' }
];

export default function () {
   return (<Select options={options} />);
}
