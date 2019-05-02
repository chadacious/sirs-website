import React, { Component } from 'react'
import * as _ from 'lodash';
import { Form, Tab, Segment, List, Grid, Button, Icon } from 'semantic-ui-react';
import DiagramOptions from '../../DiagramOptions';
import { withAppContext } from '../../../../AppContext';
import { prepareNewModel, modelChangeEvent, assignUndefined } from '../../../utils/diagram-utils';

// Do this to avoid warnings about changing controlled vs uncontrolled state
const initialState = {
    selectedNode: {
        name: '',
        extras: {
            shortName: '',
            description: '',
        },
    },
    selectedOutPort: {
        label: '',
        extras: {
            shortName: '',
            quickSelect: false,
        },
    },
};

class ButtonDecisionPopup extends Component {
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

    handleOutPortSelected = (outPort) => {
        // use the assignUndefined to initialize the object in case we add new properties to item. This way they will be loaded with initialState if the property is undefined
        // and we can avoid the error about changing a uncontrolled component to controlled component.
        this.updateState({ selectedOutPort: { ...assignUndefined(outPort, initialState.selectedOutPort), extras: assignUndefined(outPort.extras, initialState.selectedOutPort.extras) } });
    }

    handleChangeOutPort = (e, data) => {
        const { name, value } = data;
        const { selectedNode, selectedOutPort } = this.state;
        const outPort = selectedNode.ports[selectedOutPort.id];
        Object.assign(outPort, { [name]: value });
        this.updateState({ selectedNode, selectedOutPort: outPort });
    }

    handleChangeOutPortExtras = (e, data) => {
        const { name, value } = data;
        const { selectedNode, selectedOutPort } = this.state;
        const outPort = selectedNode.ports[selectedOutPort.id];
        Object.assign(outPort.extras, { [name]: value });
        this.updateState({ selectedNode, selectedOutPort: outPort });
    }

    handleDeleteOutPort = (outPort) => {
        const { selectedNode } = this.state;
        delete selectedNode.ports[outPort.id];
        
        const ports = _.keys(selectedNode.ports).map(portKey => selectedNode.ports[portKey]);
        let index = 1;
        ports.filter(port => !port.in).sort((a, b) => a.extras.sortOrder > b.extras.sortOrder ? 1 : -1)
            .forEach((port) => {
                selectedNode.ports[port.id] = Object.assign(port, { extras: { ...port.extras, sortOrder: index } });
                index += 1;
            });
        
        this.updateState({ selectedNode, selectedOutPort: { ...initialState.selectedOutPort } });
    }

    handleNewOutPortClick = () => {
        const { selectedNode } = this.state;
        let outPort = selectedNode.addOutPort("Untitled");
        outPort = { ...assignUndefined(outPort, initialState.selectedOutPort), extras: assignUndefined(outPort.extras, initialState.selectedOutPort.extras) };
        outPort.extras.sortOrder = selectedNode.getOutPorts().length;
        this.updateState({ selectedNode, selectedOutPort: outPort });
    }

    handleOutPortMove = (outPort, direction) => {
        const { selectedNode } = this.state;
        const outPorts = selectedNode.getOutPorts();
        
        const max = outPorts.length;
        let newSortOrder = outPort.extras.sortOrder += direction;
        newSortOrder = newSortOrder > max ? max : newSortOrder < 1 ? 1 : newSortOrder;
        outPorts.forEach((checkPort) => {
            if (checkPort.id === outPort.id) checkPort.extras.sortOrder = newSortOrder;
            else if (checkPort.extras.sortOrder === newSortOrder) checkPort.extras.sortOrder = newSortOrder + (-1 * direction);
        });
        this.updateState({ selectedNode, selectedOutPort: { ...initialState.selectedOutPort } });
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

        const outPorts = selectedNode.getOutPorts ? selectedNode.getOutPorts() : [];
        const {
            name,
            extras: {
                shortName = '',
                description = '',
            },
        } = selectedNode;
        const selectedOutPort = this.state.selectedOutPort;

        const panes = [
        { menuItem: 'Prompt', render: () => (
            <Tab.Pane>
                <Form.TextArea
                    label="Question or Request"
                    name="name"
                    disabled={diagramLocked}
                    placeholder="Enter the question or request..."
                    value={name}
                    onChange={this.handleChangeNode}
                />
            </Tab.Pane>
        )},
        { menuItem: 'Outcomes', render: () => (
            <Tab.Pane>
                <Segment disabled={diagramLocked} style={{overflow: 'auto', height: '175px' }}>
                    <List selection verticalAlign='middle' celled size="mini">
                        <List.Item disabled={diagramLocked} onClick={this.handleNewOutPortClick}>
                            <List.Content style={{ textAlign: 'center' }}>
                                <Button color="green">Create New Outcome</Button>
                            </List.Content>
                        </List.Item>
                        {outPorts
                            .sort((a, b) => a.extras.sortOrder > b.extras.sortOrder ? 1 : -1)
                            .map((outPort) => (
                        <List.Item key={outPort.id} onClick={() => {this.handleOutPortSelected(outPort)}}>
                        <Icon disabled={diagramLocked} link name='trash' onClick={() => this.handleDeleteOutPort(outPort)} />
                        <List.Content>
                            <List.Header>{outPort.extras.shortName || outPort.label}</List.Header>
                            {outPort.extras.shortName && <List.Description>{outPort.label}</List.Description>}
                        </List.Content>
                        <Icon disabled={diagramLocked} link size="large" name='chevron up' onClick={() => this.handleOutPortMove(outPort, -1)} />
                        <Icon disabled={diagramLocked} link size="large" name='chevron down' onClick={() => this.handleOutPortMove(outPort, 1)} />
                        </List.Item>
                        ))}
                    </List>
                </Segment>
                <Segment size="mini">
                    <Grid>
                        <Grid.Row style={{ paddingTop: '0.75em', paddingBottom: '0.75em' }}>
                            <Grid.Column width={4} textAlign='right' style={{ padding: '0', paddingTop: '0.3em' }}>
                            </Grid.Column>
                            <Grid.Column width={12} style={{ paddingTop: '0.5em' }}>
                                <Form.Checkbox
                                    label="Quick Select"
                                    data-tooltip="Allows for quick selection from a subgroup list when tagging."
                                    name="quickSelect"
                                    checked={selectedOutPort.extras.quickSelect ? true : false}
                                    onChange={(e, { name, checked }) => this.handleChangeOutPortExtras(e, { name, value: checked })}
                                    disabled={!selectedOutPort.id || diagramLocked}
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{ paddingTop: 0, paddingBottom: '0.75em' }}>
                            <Grid.Column width={4} textAlign='right' style={{ padding: '0', paddingTop: '0.3em' }}>
                            Button Text:
                            </Grid.Column>
                            <Grid.Column width={12}>
                                <Form.Input
                                    fluid
                                    name="label"
                                    placeholder='Enter the button text'
                                    value={selectedOutPort.label}
                                    disabled={!selectedOutPort.id || diagramLocked}
                                    onChange={this.handleChangeOutPort}
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{ paddingTop: 0, paddingBottom: '0.75em' }}>
                            <Grid.Column width={4} textAlign='right' style={{ padding: '0', paddingTop: '0.3em' }}>
                                Short Name:
                            </Grid.Column>
                            <Grid.Column width={12}>
                                <Form.Input
                                    fluid
                                    name="shortName"
                                    placeholder='Enter a shorter name for tight displays'
                                    value={selectedOutPort.extras.shortName}
                                    disabled={!selectedOutPort.id || diagramLocked}
                                    onChange={this.handleChangeOutPortExtras}
                                />
                            </Grid.Column>
                        </Grid.Row> 
                    </Grid>
                </Segment>
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
                    placeholder="Enter a shorter version of the question or request..."
                    value={shortName}
                    disabled={diagramLocked}
                    onChange={this.handleChangeNodeExtras}
                />
                <Form.TextArea
                    label="Description"
                    name="description"
                    placeholder="Enter a description to offer clarification for the tagger..."
                    value={description}
                    disabled={diagramLocked}
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

export default withAppContext(ButtonDecisionPopup);
