import React, {useState} from "react";
import {Button, ButtonGroup} from "@material-ui/core";

export type SelectedButtonGroupProps<T> = {
    options: Map<string, T>;
    defaultValue: T;
    onChange: (value: T) => any;
}

export function SelectedButtonGroup<T>({options, defaultValue, onChange}: SelectedButtonGroupProps<T>) {
    const [value, setValue] = useState(defaultValue);
    const outlineType = (expectedValue: T) => value === expectedValue ? "contained" : "outlined";

    const handleChange = (newValue: T) => {
        setValue(newValue);
        onChange(newValue);
    }
    const buttons = Array.from(options.entries())
        .map(([label, btnVal]) => (
            <Button
                onClick={() => handleChange(btnVal)}
                variant={outlineType(btnVal)}
                key={label}
            >
                {label}
            </Button>
        ));

    return (
        <ButtonGroup variant="outlined" size="small">
            {buttons}
        </ButtonGroup>
    );
}