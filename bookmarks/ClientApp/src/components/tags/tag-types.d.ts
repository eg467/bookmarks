/**
 * Object form used by react-select.
 * */
export declare type OptionType = {
    value: string;
    label: string;
};
export declare const toOption: (opt: string) => OptionType;
export declare const fromOption: (opt: OptionType) => string;
/**
 * Creates a tag array selector suitable for react-select tag-selection components.
 * */
export declare const selectAllTagOptions: import("reselect").OutputSelector<import("../../redux/root/reducer").AppState, OptionType[], (res: string[]) => OptionType[]>;
