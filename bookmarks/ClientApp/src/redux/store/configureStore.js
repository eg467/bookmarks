import { applyMiddleware, createStore, compose } from "redux";
import thunkMiddleware from "redux-thunk";
import rootReducer from '../root/reducer';
import { promiseMiddleware } from "../middleware/promise-middleware";
import { composeWithDevTools } from "redux-devtools-extension";
function configureStore(preloadedState) {
    const middlewares = [
        promiseMiddleware(),
        thunkMiddleware
    ];
    const middlewareEnhancer = applyMiddleware(...middlewares);
    const enhancers = [middlewareEnhancer];
    const composedEnhancers = composeWithDevTools(...enhancers);
    const store = createStore(rootReducer, preloadedState, composedEnhancers);
    return store;
}
const devMode = process.env.NODE_ENV === "development";
const composeEnhancers = (devMode && composeWithDevTools({})) || compose;
const appStore = createStore(rootReducer, composeEnhancers(applyMiddleware(promiseMiddleware(), thunkMiddleware)));
const appStore2 = configureStore();
export default appStore;
