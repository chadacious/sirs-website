import React, { Component } from 'react'
import { DiagramModel } from 'storm-react-diagrams'
import { Form, Tab, Segment } from 'semantic-ui-react';
import DiagramOptions from '../../DiagramOptions';
import { withAppContext } from '../../../../AppContext';

// Do this to avoid warnings about changing controlled vs uncontrolled state
const initialState = {
    selectedNode: {
        name: '',
        extras: {
            code: '',
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
        this.props.onClose();
    }

    handleCancel = () => {
        const { state: { diagramEngine: engine }, setAppState } = this.props.context;
        const { originalDiagram } = this.state;
        const model = new DiagramModel();
        model.deSerializeDiagram(originalDiagram, engine);
        engine.setDiagramModel(model);
        setAppState({ diagramEngine: engine });
        this.props.onClose();
    }

    render() {
        const { selectedNode } = this.state;
        const {
            name,
            extras: {
                code = '',
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
                placeholder="Enter a heading for the message..."
                value={name}
                onChange={this.handleChangeNode}
                />
                <Form.TextArea
                    label="Message"
                    name="message"
                    placeholder="Enter the message for the user..."
                    value={message}
                    onChange={this.handleChangeNodeExtras}
                />
                <Form.Input
                    fluid
                    label="Code"
                    name="code"
                    placeholder="Enter a unique human readable code if desired"
                    value={code}
                    onChange={this.handleChangeNodeExtras}
                />
            </Tab.Pane>
        )},
        { menuItem: 'Diagram', render: () => (
            <Tab.Pane>
                <DiagramOptions node={selectedNode} onUpdate={this.handleDiagramOptionsUpdate} />
            </Tab.Pane>
        )}
        ]

        return (
            <Form>
                <Tab panes={panes} style={{ height: '380px' }} />
                <Segment basic compact floated="right">
                <Form.Group>
                    <Form.Button secondary onClick={this.handleCancel}>Undo Changes</Form.Button>
                    <Form.Button primary onClick={this.handleSubmit}>Done</Form.Button>
                </Form.Group>
                </Segment>
            </Form>
        );
    }
}

export default withAppContext(MessagePopup);
