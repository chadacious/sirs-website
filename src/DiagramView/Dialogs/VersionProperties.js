import React from 'react'
import { Header, Modal, Segment, Form, Button } from 'semantic-ui-react'
import { withAppContext } from '../../AppContext';

const initialState = {
    wasOpen: false,
};

class VersionProperties extends React.Component {
    state = initialState;

    componentDidMount() {
        this.setState({ initialState });
        // Create a copy of the diagram for the cancel button
    }

    static getDerivedStateFromProps(props, state) {
        const { wasOpen } = state;
        const { open } = props;
        if (wasOpen === true && open === false) {
            return initialState;
        } else {
            return { wasOpen: open };
        }   
    }

    render() {
        const { open, onClose } = this.props;
        const { state: { filterTypeId, filterTypes, description, diagramLocked, version }, setAppState } = this.props.context;
        let filterTypeName = '';
        let major = '';
        let minor = '';
        let patch = '';

        if (filterTypes) {
            filterTypeName = (filterTypes.filter(ft => ft.id === filterTypeId)[0] || { name: '' }).name;
        }
        if (version) {
            major = version.split('.')[0];
            minor = version.split('.')[1];
            patch = version.split('.')[2];
        }
        return (
            <Modal size="tiny" open={open} closeIcon onClose={onClose}>
                <Header icon='settings' content="SIR Scale Version Properties" />
                <Modal.Content>
                    <Segment basic style={{ marginBottom: '-1.25em' }}>
                        <Form size="large">
                            <Form.Input
                                label="Filter Type"
                                disabled
                                value={filterTypeName}
                            />
                            <Segment>
                                <Form.Group style={{ textAlign: 'center', marginLeft: '80px' }}>
                                    <Form.Input
                                        id="majorVInput"
                                        disabled
                                        label="Major"
                                        value={major}
                                    />
                                    <Form.Input
                                        id="minorVInput"
                                        disabled
                                        label="Minor"
                                        value={minor}
                                    />
                                    <Form.Input
                                        id="patchVInput"
                                        disabled
                                        label="Patch"
                                        value={patch}
                                    />
                                </Form.Group>
                            </Segment>
                            <Form.TextArea
                                disabled={diagramLocked}
                                label="Description"
                                value={description}
                                onChange={(e, { value }) => setAppState({ description: value })}
                            />
                        </Form>
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    {!diagramLocked && <Button primary onClick={this.props.onClose}>Done</Button>}
                    {diagramLocked && <Button secondary onClick={this.props.onClose}>Close</Button>}
                </Modal.Actions>
            </Modal>
        );
    }
}

export default withAppContext(VersionProperties);
