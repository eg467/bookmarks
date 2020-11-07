import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app/App';
import appStore from './redux/store/configureStore';
import { Provider } from 'react-redux';

export function ReduxApp() {
    return (
        <Provider store={appStore}>
            <App />
        </Provider>
    );
}

ReactDOM.render(
    <ReduxApp />
    , document.getElementById('root'));