import React, { Component } from 'react'
import { Button, Popup } from 'semantic-ui-react';
// import { log } from '@medlor/medlor-core-lib';
import { withAppContext } from '../../../../AppContext';

import ButtonDecisionPopup from './ButtonDecisionPopup';

class ButtonDecisionOptions extends Component {
    state = {};

    handleClose = () => {
        this.setState({ open: false })
    }

    render() {
        const { node } = this.props;
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
                    style={{ minWidth: '510px', height: '500px', zIndex: 1000 }}
                    open={open}
                    onClose={this.handleClose}
                    context={this.contextRef}
                >
                    <Popup.Header>Button Decision Node Properties</Popup.Header>
                    <ButtonDecisionPopup node={node} onClose={this.handleClose} />
                </Popup>
            </React.Fragment>
        );
    }
}

export default withAppContext(ButtonDecisionOptions);
