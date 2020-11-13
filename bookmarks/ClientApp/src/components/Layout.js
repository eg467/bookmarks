import * as React from 'react';
import { Container } from 'reactstrap';
import NavMenu from './NavMenu';
export default class Layout extends React.PureComponent {
    render() {
        return (React.createElement(React.Fragment, null,
            React.createElement(NavMenu, null),
            React.createElement(Container, null, this.props.children)));
    }
}
