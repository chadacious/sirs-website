import React, { Component } from 'react'
import { DiagramModel } from 'storm-react-diagrams'
import { Form, Tab, Segment, List, Grid, Button, Icon } from 'semantic-ui-react';
import DiagramOptions from '../../DiagramOptions';
import { withAppContext } from '../../../../AppContext';

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
    selectedOutPort: {
        label: '',
        extras: {
            code: '',
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
        this.updateState({ selectedOutPort: outPort });
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
        this.updateState({ selectedNode, selectedOutPort: { ...initialState.selectedOutPort } });
    }

    handleNewOutPortClick = () => {
        const { selectedNode } = this.state;
        const outPort = selectedNode.addOutPort("Untitled");
        outPort.extras.code = Math.random().toString(36).substring(7);
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
        const outPorts = selectedNode.getOutPorts ? selectedNode.getOutPorts() : [];
        const {
            name,
            extras: {
                code = '',
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
                placeholder="Enter the question or request..."
                value={name}
                onChange={this.handleChangeNode}
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
        { menuItem: 'Outcomes', render: () => (
            <Tab.Pane>
                <Segment style={{overflow: 'auto', height: '175px' }}>
                    <List selection verticalAlign='middle' celled size="mini">
                        <List.Item onClick={this.handleNewOutPortClick}>
                            <List.Content style={{ textAlign: 'center' }}>
                                <Button color="green">Create New Outcome</Button>
                            </List.Content>
                        </List.Item>
                        {outPorts
                            .sort((a, b) => a.extras.sortOrder > b.extras.sortOrder ? 1 : -1)
                            .map((outPort) => (
                        <List.Item key={outPort.id} onClick={() => {this.handleOutPortSelected(outPort)}}>
                        <Icon link name='trash' onClick={() => this.handleDeleteOutPort(outPort)} />
                        <List.Content>
                            <List.Header>{outPort.extras.code}</List.Header>
                            <List.Description>{outPort.label}</List.Description>
                        </List.Content>
                        <Icon link size="large" name='chevron up' onClick={() => this.handleOutPortMove(outPort, -1)} />
                        <Icon link size="large" name='chevron down' onClick={() => this.handleOutPortMove(outPort, 1)} />
                        </List.Item>
                        ))}
                    </List>
                </Segment>
                <Segment size="mini">
                    <Grid>
                        <Grid.Row style={{ paddingTop: '0.75em', paddingBottom: '0.75em' }}>
                            <Grid.Column width={4} textAlign='right' style={{ padding: '0', paddingTop: '0.3em' }}>
                            Code:
                            </Grid.Column>
                            <Grid.Column width={12}>
                                <Form.Input
                                    fluid
                                    name="code"
                                    placeholder='Assign a human readable code'
                                    value={selectedOutPort.extras.code}
                                    disabled={!selectedOutPort.id}
                                    onChange={this.handleChangeOutPortExtras}
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{ paddingTop: '0.75em', paddingBottom: '0.75em' }}>
                            <Grid.Column width={4} textAlign='right' style={{ padding: '0', paddingTop: '0.3em' }}>
                            Button Text:
                            </Grid.Column>
                            <Grid.Column width={12}>
                                <Form.Input
                                    fluid
                                    name="label"
                                    placeholder='Enter the button text'
                                    value={selectedOutPort.label}
                                    disabled={!selectedOutPort.id}
                                    onChange={this.handleChangeOutPort}
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row  style={{ paddingTop: '0.75em', paddingBottom: '0.75em' }}>
                            <Grid.Column width={4} />
                            <Grid.Column width={12}>
                                <Form.Checkbox
                                    label="Quick Select"
                                    data-tooltip="Allows for quick selection from a subgroup list when tagging."
                                    name="quickSelect"
                                    checked={selectedOutPort.extras.quickSelect ? true : false}
                                    onChange={(e, { name, checked }) => this.handleChangeOutPortExtras(e, { name, value: checked })}
                                    disabled={!selectedOutPort.id} 
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </Tab.Pane>
        )},
        { menuItem: 'Diagram', render: () => (
            <Tab.Pane>
                <DiagramOptions node={selectedNode} onUpdate={this.handleDiagramOptionsUpdate} />
            </Tab.Pane>
        )},
        { menuItem: 'More', render: () => (
            <Tab.Pane>
                <Form.TextArea
                    label="Short Name"
                    name="shortName"
                    placeholder="Enter a shorter version of the question or request..."
                    value={shortName}
                    onChange={this.handleChangeNodeExtras}
                />
                <Form.TextArea
                    label="Description"
                    name="description"
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
                    <Form.Button secondary onClick={this.handleCancel}>Undo Changes</Form.Button>
                    <Form.Button primary onClick={this.handleSubmit}>Done</Form.Button>
                </Form.Group>
                </Segment>
            </Form>
        );
    }
}

export default withAppContext(ButtonDecisionPopup);
