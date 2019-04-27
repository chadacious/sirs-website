import React, { Component } from 'react'
import { Form, Tab, Segment, List, Grid, Button, Icon } from 'semantic-ui-react';
import { withAppContext } from '../../../../AppContext';
import { getOutLinks } from '../../../utils/diagram-utils';

// import { deepFind, updateSIRScale } from '../../utils/helpers';
// import { updateChecklistItemNodeOutportLabel } from '../../utils/sirScaleToDiagram';

class ProcessProps extends Component {
    state = {
        modNode: {
            name: '',
            extras: {
                code: '',
            },
        },
        selectedOutLink: {
            code: '',
            name: '',
        },
    };

    componentDidMount() {
        this.setState({ modNode: this.props.node });
    }

    handleChangeNode = (e, data) => {
        const { name, value } = data;
        this.setState({ modNode: { ...this.state.modNode, [name]: value } });
    }

    handleChangeNodeExtras = (e, data) => {
        const { name, value } = data;
        this.setState({ modNode: { extras: { ...this.state.modNode.extras , [name]: value } } });
    }

    handleChoiceChanged = (e, data) => {
        const { sirItem, selectedChoice } = this.state;
        const { name, value, remove, newChoice } = data;
        // update the sirItem choice corresponding to this selected Choice
        const newChoices = [];
        sirItem.choices.forEach((choice) => {
        if (choice.code === selectedChoice.code && !newChoice) {
            if (!remove) {
            // console.log('modifying');
            newChoices.push({ ...choice, [name]: value });
            }
        } else {
            newChoices.push({ ...choice });
        }
        });
        if (newChoice) {
        newChoices.push({ ...newChoice });
        }
        this.setState({
        selectedChoice: { ...this.state.selectedChoice, [name]: value },
        sirItem: { ...this.state.sirItem, choices: newChoices },
        });
    }

    //   handleNewChoiceClick = () => {
    //     const { sirItem } = this.state;
    //     const newChoice = {
    //       code: Math.random().toString(36).substring(7),
    //       name: '',
    //       sortOrder: sirItem.choices.length + 1,
    //     };
    //     this.setState({ selectedChoice: newChoice }, () => {
    //       this.handleChoiceChanged(null, { code: '', value: '', newChoice });
    //     });
    //   }

    //   handleChangeSubGroupAncestry = (e, data) => {
    //     // If toggled, then we'll build the subGroupAncestry to fill in all the choices up to this item if selected
    //     console.log(data);
    //   }

    handleSubmit = () => {
        // console.log(this.props);
        const { context: { setAppState, state: { diagramEngine } } } = this.props;
        const { modNode } = this.state;
        const { node } = this.props;
        const model = diagramEngine.getDiagramModel()
        const nodes = model.getNodes();
        // find the original node in the model from that which was sent in via props
        nodes[node.id] = Object.assign(nodes[node.id], modNode);
        setAppState({ diagramEngine });
        this.props.onClose();
    }

    handleOutPortSelected = (outPort) => {
        this.setState({ selectedOutPort: outPort });
    }

    handleDeleteOutPort = (outPort) => {
        this.setState({ selectedOutPort: outPort }, () => {
            this.handleOutPortChanged(null, { name: '', value: '', remove: true });
            this.setState({ selectedOutPort: null });
        });
    }

    handleCancel = () => {
        this.props.onClose();
    }

    render() {
        const { modNode } = this.state;
        const outLinks = getOutLinks(modNode);
        const {
            id,
            name,
            extras: {
                code,
                shortName,
                description,
            },
        } = modNode;
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
                <Segment style={{overflow: 'auto', height: '155px' }}>
                    <List selection verticalAlign='middle' celled size="mini">
                    {outPorts.map((outPort) => (
                        <List.Item key={outPort.id} onClick={() => {this.handleOutPortSelected(outPort)}}>
                        <Icon link name='trash' onClick={() => this.handleDeleteOutPort(outPort)} />
                        <List.Content>
                            <List.Header>{outPort.id}</List.Header>
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
                            name="id"
                            placeholder='Assign a human readable code'
                            value={selectedOutPort.code}
                            disabled={!selectedOutPort.code}
                            onChange={this.handleOutPortChanged}
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
                            onChange={this.handleOutPortChanged}
                        />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row  style={{ paddingTop: '0.75em', paddingBottom: '0.75em' }}>
                        <Grid.Column width={4} />
                        <Grid.Column width={12}>
                        <Form.Checkbox
                            label="Quick Select"
                            data-tooltip="Allows for quick selection from the subgroup list when tagging."
                            name="subGroupAcenstry"
                            value={selectedOutPort.subGroupAcenstry}
                            onChange={this.handleOutPortChanged}
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
                Tab 2 Content
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
                    <Form.Button onClick={this.handleCancel}>Cancel</Form.Button>
                    <Form.Button onClick={this.handleSubmit}>Submit</Form.Button>
                </Form.Group>
                </Segment>
            </Form>
        );
    }
}

export default withAppContext(ProcessProps);
