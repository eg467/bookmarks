import { Action, applyMiddleware, compose, createStore } from "redux";
import thunkMiddleware, { ThunkMiddleware } from "redux-thunk";
import rootReducer, { AppState } from "../root/reducer";
import { promiseMiddleware } from "../middleware/promise-middleware";
import { composeWithDevTools } from "redux-devtools-extension";
import { useDispatch } from "react-redux";

const devMode = process.env.NODE_ENV === "development";
const composeEnhancers = (devMode && composeWithDevTools({})) || compose;
const appStore = createStore(
   rootReducer,
   composeEnhancers(
      applyMiddleware(
         promiseMiddleware(),
         thunkMiddleware as ThunkMiddleware<AppState, Action>,
      ),
   ),
);

export type StoreDispatch = typeof appStore.dispatch;
export const useStoreDispatch = () => useDispatch<StoreDispatch>();
export default appStore;
