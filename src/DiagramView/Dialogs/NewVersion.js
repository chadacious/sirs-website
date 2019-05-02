import React from 'react'
import { Button, Header, Icon, Modal, List, Segment, Form, Select, Message, Input } from 'semantic-ui-react'
import { withAppContext } from '../../AppContext';
import { getFitlerTypeSIRScaleVersions, saveSIRScale, getSIRScaleDefinition, prepareNewModel, addNode } from '../utils/diagram-utils';

const initialState = {
    startFromScratch: false,
    selectedVersion: null,
    selectedFilterType: null,
    major: '',
    minor: '',
    patch: '',
    description: '',
    wasOpen: false,
};

class NewVersion extends React.Component {
    state = initialState;

    componentDidMount() {
        this.setState({ initialState });
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

    handleFilterTypeChanged = async (e, { value }) => {
        const { setAppState } = this.props.context;
        const versions = await getFitlerTypeSIRScaleVersions(value);
        setAppState({ versions });
        this.setState({ selectedFilterType: value })
    }

    handleBaseVersionSelected = (version) => {
        const { selectedVersion } = this.state;
        if (version === selectedVersion) {
            this.setState({
                selectedVersion: null,
                startFromScratch: false,
                major: '',
                minor: '',
                patch: '',
            });
        } else {
            console.log(selectedVersion);
            this.setState({
                selectedVersion: version,
                startFromScratch: false,
                major: version.split('.')[0],
                minor: version.split('.')[1],
                patch: parseInt(version.split('.')[2], 10) + 1,
            });
        }
    }

    handleStartFromScratch = () => {
        const { startFromScratch }= this.state;
        this.setState({
            selectedVersion: null,
            startFromScratch: !startFromScratch,
            major: '',
            minor: '',
            patch: '',
        })
    }

    handleCreateNewVersion = async () => {
        const { onClose, context: { state: { diagramEngine: engine, versions } } } = this.props;
        const { selectedFilterType, selectedVersion, major, minor, patch, description } = this.state;
        // selectedVersion
        const version = `${major}.${minor}.${patch}`;
        let serializedDiagram = '';
        let model = prepareNewModel();
        if (selectedVersion) {
            const sirScale = versions.filter(v => v.filterTypeId === selectedFilterType && v.version === selectedVersion)[0];
            const loadedSIRScale = await getSIRScaleDefinition(sirScale.id);
            // console.log(sirScale.id, loadedSIRScale);
            serializedDiagram = loadedSIRScale.serializedDiagram;
            // console.log(JSON.parse(serializedDiagram));
            model.deSerializeDiagram(JSON.parse(serializedDiagram), engine);
        } else {
            serializedDiagram = JSON.stringify(model.serializeDiagram());
        }
        engine.setDiagramModel(model);
        if (!selectedVersion) {
            // creating from scratch, ensure that the starting filter type node exists
            const ftNode = addNode(engine, 'FilterType');
            const { filterTypes } = this.props.context.state;
            const ft = filterTypes.filter(ft => ft.id === selectedFilterType)[0];
            ftNode.name = ft.name;
            ftNode.extras.code = ft.code;
        }
        saveSIRScale(this.props.context, -1, { filterTypeId: selectedFilterType, version, description, serializedDiagram });
        this.props.context.setAppState({ diagramLocked: false });
        onClose();
    };

    render() {
        const { open, onClose, context: { state: { versions = [] } } } = this.props;
        const { selectedVersion, selectedFilterType, startFromScratch, major, minor, patch, description } = this.state;
        const { filterTypes } = this.props.context.state;
        const filterTypeOptions = (filterTypes || []).map(ft => (
            { key: ft.code, text: ft.name, value: ft.id }
        ));

        const versionEntryEnabled = () => (selectedVersion || startFromScratch);
        const proposedVersion = `${major}.${minor}.${patch}`;
        const versionConflicts = () => (versions.map(v => v.version).includes(proposedVersion));
        const newButtonEnabled = () => (
            (selectedVersion || startFromScratch)
            && major !== ''
            && minor !== ''
            && patch !== ''
            && !versionConflicts()
        );

        return (
            <Modal size="tiny" open={open} closeIcon onClose={onClose}>
                <Header icon='plus' content="Create New SIR Scale Version" />
                <Modal.Content>
                    <p>Start by choosing a Filter Type:</p>
                    <Select 
                        fluid
                        placeholder='Select the filter type'
                        options={filterTypeOptions}
                        onChange={this.handleFilterTypeChanged}
                    />
                    <Header
                        disabled={!selectedFilterType}
                        as="h5"
                        attached="top"
                        content="Start From a Previous Version"
                        subheader="The new version can start as a clone from a previous version."
                    />
                    <Segment style={{overflow: 'auto', height: '120px' }} attached disabled={!selectedFilterType}>
                        <List selection>
                            {selectedFilterType && versions.map((version) => (
                                <List.Item key={version.version} onClick={() => this.handleBaseVersionSelected(version.version)}>
                                    <List.Content floated="left">
                                        <Icon
                                            link
                                            size="big"
                                            name={`${selectedVersion === version.version ? 'check ' : ''}square outline`}
                                        />
                                    </List.Content>
                                    <List.Content>
                                        <List.Header>{version.version}</List.Header>
                                        <List.Description>{version.description}</List.Description>
                                    </List.Content>
                                </List.Item>
                            ))}
                            <List.Item disabled={!selectedFilterType} onClick={this.handleStartFromScratch}>
                                <List.Content floated="left">
                                    <Icon
                                        link
                                        size="big"
                                        name={`${startFromScratch ? 'check ' : ''}square outline`}
                                    />
                                </List.Content>
                                <List.Content>
                                    <List.Header>Start From Scratch</List.Header>
                                    <List.Description>Start with a clean slate</List.Description>
                                </List.Content>
                            </List.Item>
                        </List>
                    </Segment>
                    <Segment basic style={{ marginBottom: '-1.25em' }} disabled={!versionEntryEnabled()}>
                        <p>Enter the new version numbers for Major, Minor, and Patch positions:</p>
                        <Form size="large">
                            <Form.Group style={{ textAlign: 'center', marginLeft: '70px' }}>
                                <Form.Input
                                    id="majorVInput"
                                    disabled={!selectedVersion && !startFromScratch}
                                    label="Major"
                                    value={major}
                                    onChange={(e, { value }) => this.setState({ major: value })}
                                />
                                <Form.Input
                                    id="minorVInput"
                                    disabled={!selectedVersion && !startFromScratch}
                                    label="Minor"
                                    value={minor}
                                    onChange={(e, { value }) => this.setState({ minor: value })}
                                />
                                <Form.Input
                                    id="patchVInput"
                                    disabled={!selectedVersion && !startFromScratch}
                                    label="Patch"
                                    value={patch}
                                    onChange={(e, { value }) => this.setState({ patch: value })}
                                />
                            </Form.Group>
                        </Form>
                        <Input
                            disabled={!selectedVersion && !startFromScratch}
                            fluid
                            label="Description"
                            value={description}
                            onChange={(e, { value }) => this.setState({ description: value })}
                        />
                    </Segment>
                    {versionConflicts() &&
                    <Message size="small" negative attached='bottom'>
                            <p>This version conflicts with another. Try incrementing the patch number.</p>
                    </Message>
                    }
                </Modal.Content>
                <Modal.Actions>
                    <Button secondary onClick={onClose}>Cancel</Button>
                    <Button primary disabled={!newButtonEnabled()} onClick={this.handleCreateNewVersion}>
                        <Icon name='plus' /> Create
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default withAppContext(NewVersion);
