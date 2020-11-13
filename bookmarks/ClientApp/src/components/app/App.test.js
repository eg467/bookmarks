import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import createStore from 'redux-mock-store';
import mockStoreState from '../../redux/store/mock-store-state';
it('renders without crashing', () => {
    const store = createStore()(mockStoreState);
    const div = document.createElement('div');
    ReactDOM.render(React.createElement(Provider, { store: store },
        React.createElement(App, null)), div);
    ReactDOM.unmountComponentAtNode(div);
});
