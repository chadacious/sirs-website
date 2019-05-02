import React, { Component } from 'react'
import { Form, Tab, Segment } from 'semantic-ui-react';
import DiagramOptions from '../../DiagramOptions';
import { withAppContext } from '../../../../AppContext';
import { prepareNewModel, modelChangeEvent } from '../../../utils/diagram-utils';

// Do this to avoid warnings about changing controlled vs uncontrolled state
const initialState = {
    selectedNode: {
        name: '',
        extras: {
            message: '',
        },
    },
};

class MessagePopup extends Component {
    state = { ...initialState };

    componentDidMount() {
        // Create a copy of the diagram for the cancel button
        const { state: { diagramEngine: engine } } = this.props.context;
        const model = engine.getDiagramModel();
        const originalDiagram = model.serializeDiagram();
        this.updateState({ selectedNode: this.props.node, originalDiagram });
    }

    updateState(newState, callback) {
        const { setAppState, state: { diagramEngine } } = this.props.context;
        this.setState(newState, callback);
        setAppState({ diagramEngine });
    }

    handleChangeNode = (e, data) => {
        const { name, value } = data;
        this.updateState({ selectedNode: Object.assign(this.state.selectedNode, { [name]: value }) });
    }

    handleChangeNodeExtras = (e, data) => {
        const { name, value } = data;
        const extras = Object.assign(this.state.selectedNode.extras, { [name]: value });
        this.updateState({ selectedNode: Object.assign(this.state.selectedNode, { extras }) });
    }

    handleDiagramOptionsUpdate = (changes) => {
        const { selectedNode } = this.state;
        Object.assign(selectedNode, changes);
        this.updateState({ selectedNode });
    }

    handleSubmit = () => {
        modelChangeEvent({ id: 'ButtonDecisionPopup.Submit' });
        this.props.onClose();
    }

    handleCancel = () => {
        const { state: { diagramEngine: engine }, setAppState } = this.props.context;
        const { originalDiagram } = this.state;
        const model = prepareNewModel();
        model.deSerializeDiagram(originalDiagram, engine);
        engine.setDiagramModel(model);
        setAppState({ diagramEngine: engine });
        this.props.onClose();
    }

    render() {
        const { selectedNode } = this.state;
        const { diagramLocked } = this.props.context.state;

        const {
            name,
            extras: {
                message = '',
            },
        } = selectedNode;

        const panes = [
        { menuItem: 'Prompt', render: () => (
            <Tab.Pane>
                <Form.Input
                    fluid
                    label="Heading"
                    name="name"
                    disabled={diagramLocked}
                    placeholder="Enter a heading for the message..."
                    value={name}
                    onChange={this.handleChangeNode}
                />
                <Form.TextArea
                    label="Message"
                    name="message"
                    disabled={diagramLocked}
                    placeholder="Enter the message for the user..."
                    value={message}
                    onChange={this.handleChangeNodeExtras}
                />
            </Tab.Pane>
        )},
        { menuItem: 'Diagram', render: () => (
            <Tab.Pane>
                <DiagramOptions disabled={diagramLocked} node={selectedNode} onUpdate={this.handleDiagramOptionsUpdate} />
            </Tab.Pane>
        )}
        ]

        return (
            <Form>
                <Tab panes={panes} style={{ height: '380px' }} />
                <Segment basic compact floated="right">
                <Form.Group>
                    <Form.Button secondary onClick={this.handleCancel}>{diagramLocked ? 'Close' : 'Undo Changes'}</Form.Button>
                    {!diagramLocked && <Form.Button primary onClick={this.handleSubmit}>Done</Form.Button>}
                </Form.Group>
                </Segment>
            </Form>
        );
    }
}

export default withAppContext(MessagePopup);
