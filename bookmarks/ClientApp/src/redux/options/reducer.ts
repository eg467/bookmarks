import * as actions from "./actions";
import { AppState } from "../root/reducer";
import produce from "immer";

export enum BookmarkDisplayElements {
   /** 
    * URL only
    * */
   none = 0,
   title = 1 << 0,
   image = 1 << 1,
   favicon = 1 << 2,
   description = 1 << 3,
   tags= 1 << 4 ,
   domain = 1 << 5,
   edit = 1 << 6,
   all = ~(~0 << 7),
}

export type BookmarkLayout  = "masonry" | "list";

export type OptionsState = {
   displayedElements: BookmarkDisplayElements;
   layout: BookmarkLayout;
}

export const initialState: OptionsState = {
   displayedElements: BookmarkDisplayElements.all & ~BookmarkDisplayElements.edit,
   layout: "list",
};

const reducer = produce(
   (
      state: OptionsState,
      action: actions.OptionsAction,
   ) => {
      switch (action.type) {
         case actions.ActionType.SET_LAYOUT:
            state.layout = action.layout;
            break;
         case actions.ActionType.TOGGLE_DISPLAY_ELEMENT:
            let { elements, shown } = action;
            const initialElements: BookmarkDisplayElements = state.displayedElements;
            state.displayedElements = shown ? (initialElements | elements) : (initialElements & ~elements);
            break;
            
      }
   },
   initialState,
);

export default reducer;

const selectLayout = (state: AppState) => state.options.layout;
const selectDisplayElementQuery = (state: AppState) => 
   (element: BookmarkDisplayElements) => (state.options.displayedElements & element) === element;

// COMBINED SELECTORS

export const selectors = {
   selectLayout,
   selectDisplayElementQuery
};

// END COMBINED SELECTORS

