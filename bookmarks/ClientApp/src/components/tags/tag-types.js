import { createSelector } from "reselect";
import { selectors } from "../../redux/bookmarks/reducer";
export const toOption = (opt) => ({ label: opt, value: opt });
export const fromOption = (opt) => opt.value;
/**
 * Creates a tag array selector suitable for react-select tag-selection components.
 * */
export const selectAllTagOptions = createSelector([selectors.selectAllTags], tags => tags.map(toOption));
