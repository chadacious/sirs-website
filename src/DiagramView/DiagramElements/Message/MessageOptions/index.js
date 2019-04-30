import React, { Component } from 'react'
import { Button, Popup } from 'semantic-ui-react';
import MessagePopup from './MessagePopup';

export default class MessageOptions extends Component {
    state = {};

    handleClose = () => {
        this.setState({ open: false })
    }

    render() {
        const { node /* , node: { type } */ } = this.props;
        const { open } = this.state;
        return (
            <React.Fragment>
                <Button
                    className="ui tiny circular icon button floating label"
                    onClick={() => this.setState({ open: !open })}
                    circular
                    size="mini"
                    icon='settings'
                    ref={(ref) => { if (ref) { this.contextRef = ref.ref; } }}
                />
                <Popup
                    wide="very"
                    style={{ minWidth: '400px', height: '500px', zIndex: 1000 }}
                    open={open}
                    onClose={this.handleClose}
                    context={this.contextRef}
                >
                    <Popup.Header>Message Node Properties</Popup.Header>
                    <MessagePopup node={node} onClose={this.handleClose} />
                </Popup>
            </React.Fragment>
        );
    }
}
