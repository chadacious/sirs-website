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
            code: '',
            shortName: '',
            description: '',
        },
    },
};

class FilterTypePopup extends Component {
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
                code = '',
                shortName = '',
                description = '',
            },
        } = selectedNode;

        const panes = [
        { menuItem: 'Prompt', render: () => (
            <Tab.Pane>
            <Form.TextArea
                label="Filter Type Name"
                name="name"
                disabled={diagramLocked}
                placeholder="Enter the name of this filter type..."
                value={name}
                onChange={this.handleChangeNode}
            />
            <Form.Input
                fluid
                label="Code"
                name="code"
                disabled={diagramLocked}
                placeholder="Enter a unique human readable code if desired"
                value={code}
                onChange={this.handleChangeNodeExtras}
            />
            </Tab.Pane>
        )},
        { menuItem: 'Diagram', render: () => (
            <Tab.Pane>
                <DiagramOptions disabled={diagramLocked} node={selectedNode} onUpdate={this.handleDiagramOptionsUpdate} />
            </Tab.Pane>
        )},
        { menuItem: 'More', render: () => (
            <Tab.Pane>
                <Form.TextArea
                    label="Short Name"
                    name="shortName"
                    disabled={diagramLocked}
                    placeholder="Enter a shorter version of the question or request..."
                    value={shortName}
                    onChange={this.handleChangeNodeExtras}
                />
                <Form.TextArea
                    label="Description"
                    name="description"
                    disabled={diagramLocked}
                    placeholder="Enter a description to offer clarification for the tagger..."
                    value={description}
                    onChange={this.handleChangeNodeExtras}
                />
            </Tab.Pane>
        )},
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

export default withAppContext(FilterTypePopup);
