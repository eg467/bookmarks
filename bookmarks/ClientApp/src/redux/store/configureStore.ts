import { applyMiddleware, createStore, compose, Action, Dispatch, AnyAction } from "redux";
import thunkMiddleware, { ThunkMiddleware } from "redux-thunk";
import rootReducer, { AppState } from '../root/reducer';
import { PromiseDispatch, PromiseMiddleware, promiseMiddleware } from "../middleware/promise-middleware";
import { composeWithDevTools } from "redux-devtools-extension";

function configureStore(preloadedState?: AppState) {
    const middlewares = [
        promiseMiddleware() as PromiseMiddleware<PromiseDispatch<AnyAction>, AppState, AnyAction>,
        thunkMiddleware as ThunkMiddleware<AppState, Action>];

    const middlewareEnhancer = applyMiddleware(...middlewares);
    const enhancers = [middlewareEnhancer];
    const composedEnhancers = composeWithDevTools(...enhancers);
    const store = createStore(rootReducer, preloadedState, composedEnhancers);
    return store;
}

const devMode = process.env.NODE_ENV === "development";
const composeEnhancers = (devMode && composeWithDevTools({})) || compose;
const appStore = createStore(rootReducer, composeEnhancers(
    applyMiddleware(promiseMiddleware(), thunkMiddleware as ThunkMiddleware<AppState, Action>)
));

const appStore2 = configureStore();
export type StoreDispatch = typeof appStore.dispatch;
export type StoreDispatch2 = typeof appStore2.dispatch;

export default appStore;