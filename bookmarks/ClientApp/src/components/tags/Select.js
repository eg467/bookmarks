import React from 'react';
import ReactSelect from 'react-select';
import ReactCreatableSelect from 'react-select/creatable';
import { fromOption, toOption } from './tag-types';
export default function ({ canAdd = true, valueStrings, onChangedStrings, ...rest }) {
    function handleChange(newValue) {
        if (typeof onChangedStrings === "undefined") {
            throw Error("An undefined change handler was called.");
        }
        newValue = newValue || [];
        const isArray = (v) => Array.isArray(v);
        if (isArray(newValue)) {
            const items = newValue.map(fromOption);
            onChangedStrings(items);
        }
        else {
            // Single-item selection (not used for now).
            onChangedStrings([fromOption(newValue)]);
        }
    }
    const innerProps = {
        isMulti: true,
        isClearable: true,
        ...rest,
        onChange: onChangedStrings ? handleChange : rest.onChange,
        value: valueStrings ? valueStrings.map(toOption) : rest.value
    };
    return canAdd
        ? React.createElement(ReactCreatableSelect, Object.assign({}, innerProps))
        : React.createElement(ReactSelect, Object.assign({}, innerProps));
}
;
