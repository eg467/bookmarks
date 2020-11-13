import React from 'react';
import ReactSelect, { OptionsType, ValueType } from 'react-select';
import ReactCreatableSelect, { Props as CreatableProps } from 'react-select/creatable';
import { fromOption, OptionType, toOption } from './tag-types';

export type SelectProps = CreatableProps<OptionType> & {
    canAdd?: boolean;
    onChangedStrings?: (value: string[]) => any;
    valueStrings?: string[]
}

export default function ({ canAdd = true, valueStrings, onChangedStrings, ...rest }: SelectProps) {
    function handleChange(newValue: ValueType<OptionType>) {
        if (typeof onChangedStrings === "undefined") { throw Error("An undefined change handler was called."); }

        newValue = newValue || [];
        const isArray = (v: ValueType<OptionType>): v is OptionsType<OptionType> => Array.isArray(v);

        if (isArray(newValue)) {
            const items = newValue.map(fromOption);

            onChangedStrings(items);
        } else {
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
        ? <ReactCreatableSelect {...innerProps} />
        : <ReactSelect {...innerProps} />;
};