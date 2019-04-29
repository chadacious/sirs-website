import React, { Component } from 'react'
import { Form, Tab, Segment, Radio, Grid } from 'semantic-ui-react';
import { levelColors, prepareNewModel, modelChangeEvent } from '../../../utils/diagram-utils';
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

class SIRLevelPopup extends Component {
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

    handleChangeLevel = (e, data) => {
        const { value } = data;
        const { selectedNode } = this.state;
        Object.assign(selectedNode, { name: `Level ${value}`, color: levelColors[value] })
        const extras = Object.assign(selectedNode.extras, { level: value });
        this.updateState({ selectedNode: Object.assign(selectedNode, { extras }) });
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
        const levels = [1, 2, 3, 4];

        const panes = [
        { menuItem: 'Prompt', render: () => (
            <Tab.Pane>
                <Grid>
                    <Grid.Row>
                        {[0, 4].map((offset) => (
                            <Grid.Column width={8}>
                                {levels.map((level) => {
                                    const levelSelected = selectedNode.extras.level === level + offset;
                                    const currentLevel = level + offset;
                                    return (
                                    <Segment color={levelColors[currentLevel]} inverted={levelSelected}>
                                        <Radio
                                            label={`Level ${level + offset}`}
                                            name="levelGroup"
                                            slider
                                            color="green"
                                            value={level + offset}
                                            checked={levelSelected}
                                            onChange={this.handleChangeLevel}
                                        />
                                    </Segment>
                                    );
                                })}
                            </Grid.Column>
                        ))}
                    </Grid.Row>
                </Grid>
            </Tab.Pane>
        )},
        // { menuItem: 'Diagram', render: () => (
        //     <Tab.Pane>
        //         <DiagramOptions node={selectedNode} onUpdate={this.handleDiagramOptionsUpdate} />
        //     </Tab.Pane>
        // )}
        ]

        return (
            <Form>
                <Tab panes={panes} />
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

export default withAppContext(SIRLevelPopup);
