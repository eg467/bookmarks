import { NullAction } from "../common/actions";
import { BookmarkDisplayElements, BookmarkLayout } from "./reducer";

export enum ActionType {
   TOGGLE_DISPLAY_ELEMENT = "options/TOGGLE_DISPLAY_ELEMENT",
   SET_LAYOUT = "options/SET_LAYOUT",
}

// ACTIONS

export interface ToggleDisplayElementAction {
   type: ActionType.TOGGLE_DISPLAY_ELEMENT,
   elements: BookmarkDisplayElements,
   shown: boolean, 
}

export interface SetLayoutAction {
   type: ActionType.SET_LAYOUT,
   layout: BookmarkLayout,
}

export type OptionsAction = ToggleDisplayElementAction | SetLayoutAction | NullAction;

// END ACTIONS

// ACTION CREATORS

export const actionCreators = {
   toggleDisplayElement: (elements: BookmarkDisplayElements, shown: boolean): ToggleDisplayElementAction => {
      return { type: ActionType.TOGGLE_DISPLAY_ELEMENT, elements, shown };
   },
   
   setLayout: (layout: BookmarkLayout): SetLayoutAction => {
      return { type: ActionType.SET_LAYOUT, layout };
   }
};

// END ACTION CREATORS
