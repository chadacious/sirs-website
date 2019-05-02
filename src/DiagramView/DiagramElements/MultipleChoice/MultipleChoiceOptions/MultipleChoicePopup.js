import React, { Component } from 'react'
import * as _ from 'lodash';
import { Form, Tab, Segment, List, Grid, Button, Icon } from 'semantic-ui-react';
// import { log } from '@medlor/medlor-core-lib';
import { levelColors, updateOutPortItemLabel, prepareNewModel, modelChangeEvent, addNode, assignUndefined } from '../../../utils/diagram-utils';
import DiagramOptions from '../../DiagramOptions';
import { withAppContext } from '../../../../AppContext';

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
            level: null,
        },
    },
    selectedOutPortItem: {
        id: '',
        name: '',
        shortName: '',
        sortOrder: '',
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
        const { diagramEngine: engine, diagramEngine: { diagramModel: model } } = this.props.context.state;
        const { selectedNode, selectedOutPort } = this.state;
        const outPort = selectedNode.ports[selectedOutPort.id];
        // For conveniences, we'll update the level node and link for this port
        if (name === 'level') {
            let position;
            // remove any node and link from a previous level assignment
            // log.trace('outPort', outPort.extras.level);
            // log.trace('new level', value);
            if (outPort.extras.level && outPort.extras.level !== value) {
                // log.trace('removing old level node and link:', outPort.extras.level);
                const link = model.links[_.keys(outPort.links)[0]];
                // log.trace('found old link', outPort.links, link);
                if (link) {
                    // log.trace('deleting node', link.targetPort.parent);
                    if (link.targetPort.parent) {
                        position = { x: link.targetPort.parent.x, y: link.targetPort.parent.y };
                        model.removeNode(link.targetPort.parent);
                    }
                    outPort.removeLink(link);
                    model.removeLink(link);
                }
            }
            // now add the level node and link it to this port
            // log.trace('adding level node and link for level', value);
            const newNode = addNode(engine, 'SIRLevel');
            newNode.extras.level = value;
            newNode.name = `Level ${value}`;
            newNode.color = levelColors[value];
            if (position) {
                newNode.x = position.x;
                newNode.y = position.y;
            }
            // log.trace(_.keys(newNode.ports));
            // log.trace(newNode.ports);
            // log.trace(newNode.ports[_.keys(newNode.ports)[0]]);
            const targetPort = newNode.ports[_.keys(newNode.ports)[0]];
            const link = outPort.link(targetPort);
            model.addLink(link);
            // log.trace(newNode);
            engine.setDiagramModel(model);
            // log.trace(model);
        }
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
        
        console.log('selectedNode.ports', selectedNode.ports);
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

    handleNewOutPortItemClick = () => {
        const { selectedOutPort } = this.state;
        if (!selectedOutPort.extras.items) selectedOutPort.extras.items = [];
        const newItem = assignUndefined({
            id: Math.random().toString(36).substring(7),
            sortOrder: selectedOutPort.extras.items.length + 1,
        }, initialState.selectedOutPortItem);
        selectedOutPort.extras.items.push(newItem);
        this.updateState({ selectedOutPort, selectedOutPortItem: newItem });
    }

    handleOutPortItemSelected = (item) => {
        // use the assignUndefined to initialize the object in case we add new properties to item. This way they will be loaded with initialState if the property is undefined
        // and we can avoid the error about changing a uncontrolled component to controlled component.
        this.updateState({ selectedOutPortItem: assignUndefined(item, initialState.selectedOutPortItem) });
    }
    
    handleCloseOutPortItems = () => {
        this.setState({ editingCheckListItems: false, selectedOutPortItem: initialState.selectedOutPortItem });
    }

    handleOutPortItemChanged = (e, data) => {
        const { name, value } = data;
        this.updateState({ selectedOutPortItem: Object.assign(this.state.selectedOutPortItem, { [name]: value }) });
    }

    handleDeleteOutPortItem = (outPortItem) => {
        const { selectedNode, selectedOutPort } = this.state;
        // const index = selectedOutPort.extras.items.findIndex(item => item.id === outPortItem.id);
        const newItems = [];
        let index = 1;
        selectedOutPort.extras.items
            .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
            .forEach((item) => {
                if (item.id !== outPortItem.id) {
                    newItems.push({ ...item, sortOrder: index });
                    index += 1;
                }
            });
        // delete selectedOutPort.extras.items[index];
        selectedOutPort.extras.items = newItems;
        this.updateState({ selectedNode, selectedOutPort });
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
        const { diagramLocked } = this.props.context.state;
        const {
            name,
            extras: {
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
                    disabled={diagramLocked}
                    placeholder="Enter the question or request..."
                    value={name}
                    onChange={this.handleChangeNode}
                />
            </Tab.Pane>
        )},
        { menuItem: 'Levels', render: () => (
            <Tab.Pane>
                {editingCheckListItems === false &&
                <React.Fragment>
                    <Segment disabled={diagramLocked} style={{overflow: 'auto', height: '210px' }}>
                        <List selection verticalAlign='middle' celled size="mini">
                            <List.Item disabled={diagramLocked} onClick={this.handleNewOutPortClick}>
                                <List.Content style={{ textAlign: 'center' }}>
                                    <Button disabled={diagramLocked} color="green">Add Level</Button>
                                </List.Content>
                            </List.Item>
                            {outPorts
                                .sort((a, b) => a.extras.sortOrder > b.extras.sortOrder ? 1 : -1)
                                .map((outPort) => (
                            <List.Item key={outPort.id} onClick={() => {this.handleOutPortSelected(outPort)}}>
                                <Icon disabled={diagramLocked} link name='trash' onClick={() => this.handleDeleteOutPort(outPort)} />
                                <List.Content>
                                    <List.Header>{`Level ${outPort.extras.level}`}</List.Header>
                                    <List.Description>{updateOutPortItemLabel(outPort)}</List.Description>
                                </List.Content>
                                <Icon disabled={diagramLocked} link size="large" name='chevron up' onClick={() => this.handleOutPortMove(outPort, -1)} />
                                <Icon disabled={diagramLocked} link size="large" name='chevron down' onClick={() => this.handleOutPortMove(outPort, 1)} />
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
                                        disabled={!selectedOutPort.id || diagramLocked}
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
                                        {diagramLocked ? 'Show Check Items' : 'Edit Check Items'}
                                    </Button>
                                </Grid.Column>
                            </Grid.Row> 
                            <Grid.Row style={{ paddingTop: 0, paddingBottom: '0.75em' }}>
                                <Grid.Column width={3} textAlign='right' style={{ padding: '0', paddingTop: '0.3em' }}>
                                    Short Name:
                                </Grid.Column>
                                <Grid.Column width={13}>
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
                </React.Fragment>
                }
                {editingCheckListItems &&
                <React.Fragment>
                    <Segment disabled={diagramLocked} style={{overflow: 'auto', height: 195 }}>
                    <List selection size="mini">
                        <List.Item disabled={diagramLocked} onClick={this.handleNewOutPortItemClick}>
                            <List.Content style={{ textAlign: 'center' }}>
                                <Button disabled={diagramLocked} basic color={levelColors[selectedOutPort.extras.level]}>
                                    Add Level {selectedOutPort.extras.level} Check Item
                                </Button>
                            </List.Content>
                        </List.Item>
                        {(selectedOutPort.extras.items || [])
                            .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
                            .map((item) => {
                        // console.log(item.name);
                        return (
                            <List.Item key={item.id} onClick={() => {this.handleOutPortItemSelected(item)}}>
                                <Icon disabled={diagramLocked} link name='trash' onClick={() => this.handleDeleteOutPortItem(item)} />
                                <List.Content>
                                    <List.Header>{item.shortName || item.name}</List.Header>
                                    {item.shortName && <List.Description>{item.name}</List.Description>}
                                </List.Content>
                                <Icon disabled={diagramLocked} link size="large" name='chevron up' onClick={() => this.handleOutPortItemMove(item, -1)} />
                                <Icon disabled={diagramLocked} link size="large" name='chevron down' onClick={() => this.handleOutPortItemMove(item, 1)} />
                            </List.Item>
                        )}
                        )}
                    </List>
                    </Segment>
                    <Segment size="mini">
                        <Grid>
                            <Grid.Row style={{ paddingTop: 0, paddingBottom: '0.75em' }}>
                                <Grid.Column width={4} textAlign='right' style={{ padding: '0', paddingTop: '0.3em' }}>
                                Checkbox Text:
                                </Grid.Column>
                                <Grid.Column width={12}>
                                    <Form.Input
                                        fluid
                                        name="name"
                                        placeholder='Enter the button text'
                                        value={selectedOutPortItem.name}
                                        disabled={!selectedOutPortItem.id || diagramLocked}
                                        onChange={this.handleOutPortItemChanged}
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
                                        placeholder='Enter a short name for tight displays'
                                        value={selectedOutPortItem.shortName}
                                        disabled={!selectedOutPortItem.id || diagramLocked}
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
                {editingCheckListItems === false &&
                <Form.Group>
                    <Form.Button secondary onClick={this.handleCancel}>{diagramLocked ? 'Close' : 'Undo Changes'}</Form.Button>
                    {!diagramLocked && <Form.Button primary onClick={this.handleSubmit}>Done</Form.Button>}
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
