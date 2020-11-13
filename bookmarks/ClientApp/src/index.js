import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app/App';
import appStore from './redux/store/configureStore';
import { Provider } from 'react-redux';
export function ReduxApp() {
    return (React.createElement(Provider, { store: appStore },
        React.createElement(App, null)));
}
ReactDOM.render(React.createElement(ReduxApp, null), document.getElementById('root'));
