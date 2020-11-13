import { createSelector } from "reselect";
import { selectors } from "../../redux/bookmarks/reducer";

/**
 * Object form used by react-select.
 * */
export type OptionType = {
    value: string;
    label: string;
}
export const toOption = (opt: string): OptionType => ({ label: opt, value: opt });
export const fromOption = (opt: OptionType): string => opt.value;

/**
 * Creates a tag array selector suitable for react-select tag-selection components.
 * */
export const selectAllTagOptions =
    createSelector([selectors.selectAllTags], tags => tags.map(toOption));