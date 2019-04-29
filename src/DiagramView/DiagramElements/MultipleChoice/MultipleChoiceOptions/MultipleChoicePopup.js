import React, { Component } from 'react'
import { Form, Tab, Segment, List, Grid, Button, Icon } from 'semantic-ui-react';
import { levelColors, updateOutPortItemLabel, prepareNewModel, modelChangeEvent } from '../../../utils/diagram-utils';
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
            level: null,
        },
    },
    selectedOutPortItem: {
        code: '',
        name: '',
    },
    editingCheckListItems: false,
};

class MultipleChoicePopup extends Component {
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
        // console.log(outPort);
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
        // console.log(outPort);
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

    handleNewOutPortItemClick = () => {
        const { selectedOutPort } = this.state;
        if (!selectedOutPort.extras.items) selectedOutPort.extras.items = [];
        const newItem = {
            id: Math.random().toString(36).substring(7),
            code: Math.random().toString(36).substring(7),
            name: '',
            sortOrder: selectedOutPort.extras.items.length + 1,
        };
        selectedOutPort.extras.items.push(newItem);
        this.updateState({ selectedOutPort });
    }

    handleOutPortItemSelected = (item) => {
        this.updateState({ selectedOutPortItem: item });
    }
    
    handleCloseOutPortItems = () => {
        this.setState({ editingCheckListItems: false, selectedOutPortItem: initialState.selectedOutPortItem });
    }

    handleOutPortItemChanged = (e, data) => {
        const { name, value } = data;
        this.updateState({ selectedOutPortItem: Object.assign(this.state.selectedOutPortItem, { [name]: value }) });
    }

    handleOutPortItemMove = (outPortItem, direction) => {
        const { selectedNode, selectedOutPort } = this.state;
        const outPortItems = selectedOutPort.extras.items;
        
        const max = outPortItems.length;
        let newSortOrder = outPortItem.sortOrder += direction;
        newSortOrder = newSortOrder > max ? max : newSortOrder < 1 ? 1 : newSortOrder;
        outPortItems.forEach((checkPortItem) => {
            if (checkPortItem.id === outPortItem.id) checkPortItem.sortOrder = newSortOrder;
            else if (checkPortItem.sortOrder === newSortOrder) checkPortItem.sortOrder = newSortOrder + (-1 * direction);
        });
        console.log(outPortItems);
        this.updateState({
            selectedNode,
            selectedOutPort,
            selectedOutPortItem: { ...initialState.selectedOutPortItem },
        });
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
        const { selectedNode, editingCheckListItems, selectedOutPortItem } = this.state;
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
        const existingLevels = outPorts.map((port) => (port.extras.level));
        const allLevels = [1, 2, 3, 4, 5, 6, 7, 8]
            .map(level => ({ key: level, text: `Level ${level}`, value: level }));
        const levels = allLevels.filter(level => !existingLevels.includes(level.value));

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
        { menuItem: 'Levels', render: () => (
            <Tab.Pane>
                {editingCheckListItems === false &&
                <React.Fragment>
                    <Segment style={{overflow: 'auto', height: '255px' }}>
                        <List selection verticalAlign='middle' celled size="mini">
                            <List.Item onClick={this.handleNewOutPortClick}>
                                <List.Content style={{ textAlign: 'center' }}>
                                    <Button color="green">Add Level</Button>
                                </List.Content>
                            </List.Item>
                            {outPorts
                                .sort((a, b) => a.extras.sortOrder > b.extras.sortOrder ? 1 : -1)
                                .map((outPort) => (
                            <List.Item key={outPort.id} onClick={() => {this.handleOutPortSelected(outPort)}}>
                                <Icon link name='trash' onClick={() => this.handleDeleteOutPort(outPort)} />
                                <List.Content>
                                    <List.Header>{`Level ${outPort.extras.level}`}</List.Header>
                                    <List.Description>{updateOutPortItemLabel(outPort)}</List.Description>
                                </List.Content>
                                <Icon link size="large" name='chevron up' onClick={() => this.handleOutPortMove(outPort, -1)} />
                                <Icon link size="large" name='chevron down' onClick={() => this.handleOutPortMove(outPort, 1)} />
                            </List.Item>
                            ))}
                        </List>
                    </Segment>
                    <Segment size="small">
                        <Grid>
                            <Grid.Row style={{ paddingTop: '0.75em', paddingBottom: '0.75em' }}>
                                <Grid.Column width={3} textAlign='right' style={{ padding: '0', paddingTop: '0.3em' }}>
                                Level:
                                </Grid.Column>
                                <Grid.Column width={6}>
                                    <Form.Select
                                        name="level"
                                        disabled={!selectedOutPort.id}
                                        text={(allLevels[selectedOutPort.extras.level - 1] || {}).text}
                                        options={levels}
                                        onChange={this.handleChangeOutPortExtras}
                                    />
                                </Grid.Column>
                                <Grid.Column width={1} />
                                <Grid.Column width={6}>
                                    <Button
                                        fluid
                                        primary
                                        size="small"
                                        basic
                                        disabled={!selectedOutPort.id}
                                        onClick={() => this.setState({ editingCheckListItems: true })}
                                    >
                                        Edit Check Items
                                    </Button>
                                </Grid.Column>
                            </Grid.Row> 
                        </Grid>             
                    </Segment>
                </React.Fragment>
                }
                {editingCheckListItems &&
                <React.Fragment>
                    <Segment style={{overflow: 'auto', height: 213 }}>
                    <List selection size="mini">
                        <List.Item onClick={this.handleNewOutPortItemClick}>
                            <List.Content style={{ textAlign: 'center' }}>
                                <Button basic color={levelColors[selectedOutPort.extras.level]}>
                                    Add Level {selectedOutPort.extras.level} Check Item
                                </Button>
                            </List.Content>
                        </List.Item>
                        {(selectedOutPort.extras.items || [])
                            .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
                            .map((item) => {
                        // console.log(item.name);
                        return (
                            <List.Item key={item.code} onClick={() => {this.handleOutPortItemSelected(item)}}>
                                <Icon link name='trash' onClick={() => this.handleDeleteOutPortItem(item)} />
                                <List.Content>
                                    <List.Header>{item.code}</List.Header>
                                    <List.Description>{item.name}</List.Description>
                                </List.Content>
                                <Icon link size="large" name='chevron up' onClick={() => this.handleOutPortItemMove(item, -1)} />
                                <Icon link size="large" name='chevron down' onClick={() => this.handleOutPortItemMove(item, 1)} />
                            </List.Item>
                        )}
                        )}
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
                                        value={selectedOutPortItem.code}
                                        disabled={!selectedOutPortItem.code}
                                        onChange={this.handleOutPortItemChanged}
                                    />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row style={{ paddingTop: '0.75em', paddingBottom: '0.75em' }}>
                                <Grid.Column width={4} textAlign='right' style={{ padding: '0', paddingTop: '0.3em' }}>
                                Checkbox Text:
                                </Grid.Column>
                                <Grid.Column width={12}>
                                    <Form.Input
                                        fluid
                                        name="name"
                                        placeholder='Enter the button text'
                                        value={selectedOutPortItem.name}
                                        disabled={!selectedOutPortItem.code}
                                        onChange={this.handleOutPortItemChanged}
                                    />
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Segment>
                </React.Fragment>
                }
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
                {editingCheckListItems === false &&
                <Form.Group>
                    <Form.Button secondary onClick={this.handleCancel}>Undo Changes</Form.Button>
                    <Form.Button primary onClick={this.handleSubmit}>Done</Form.Button>
                </Form.Group>
                }
                {editingCheckListItems &&
                <Form.Group>
                    <Form.Button onClick={this.handleCloseOutPortItems}>Close Items</Form.Button>
                </Form.Group>
                }
                </Segment>
            </Form>
        );
    }
}

export default withAppContext(MultipleChoicePopup);
