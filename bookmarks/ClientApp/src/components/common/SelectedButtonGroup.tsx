import React, {useState} from "react";
import {Button, ButtonGroup, ButtonProps} from "@material-ui/core";

export type SelectedButtonGroupProps<T> = ButtonProps & {
    options: Map<string, T>;
    defaultSelection: T;
    onSelectionChange: (value: T) => any;
}

export function SelectedButtonGroup<T>({options, defaultSelection, onSelectionChange, ...rest}: SelectedButtonGroupProps<T>) {
    const [value, setValue] = useState(defaultSelection);
    const outlineType = (expectedValue: T) => {
        const style = defaultSelection === expectedValue ? "contained" : "outlined";
        console.log(defaultSelection, expectedValue, style, options, defaultSelection);
        return style;
    }

    const handleChange = (newValue: T) => {
        //setValue(newValue);
        onSelectionChange(newValue);
    }
    const buttons = Array.from(options.entries())
        .map(([label, btnVal]) => (
            <Button
                {...rest}
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