import React from 'react'
import { DiagramModel } from 'storm-react-diagrams';
import { log } from '@medlor/medlor-core-lib';
import { Header, Icon, Modal, List, Select, Segment, Button, Confirm, Container } from 'semantic-ui-react'
import { withAppContext } from '../../AppContext';
import {
    getFitlerTypeSIRScaleVersions,
    getSIRScaleDefinition,
    addModelListeners,
    checkForUnsavedRevision,
} from '../utils/diagram-utils';
import db from '../../IndexedDB';

const initialState = {
    selectedFilterType: null,
    unsavedDefinition: null,
    versions: null,
    version: null,
};

class OpenVersion extends React.Component {
    state = initialState;

    loadFromServer = async () => {
        const { selectedFilterType, version, versions } = this.state;
        const sirScale = versions.filter(v => v.filterTypeId === selectedFilterType && v.version === version)[0];
        const loadedSIRScale = await getSIRScaleDefinition(sirScale.id);
        // clean out old revisions as they no longer apply
        log.trace({ selectedFilterType, version });
        db.diagram.where({ filterTypeId: selectedFilterType, version }).delete();
        let diagramLocked = false;
        if (loadedSIRScale.publishedAt) {
            log.trace('loadedSIRScale.publishedAt', new Date(loadedSIRScale.publishedAt));
            diagramLocked = new Date(loadedSIRScale.publishedAt) < new Date();
        }
        return { diagramLocked, ...loadedSIRScale };
    }

    loadFromIndexedDB = async () => {
        return this.state.unsavedDefinition;
    }

    loadIntoDiagram = (definition) => {
        const { setAppState, state: { diagramEngine: engine } } = this.props.context;
        const { selectedFilterType, version, versions } = this.state;
        const sirScale = versions.filter(v => v.filterTypeId === selectedFilterType && v.version === version)[0];
        const model = new DiagramModel();
        const { serializedDiagram, diagramLocked, description } = definition;
        model.deSerializeDiagram(JSON.parse(serializedDiagram), engine);
        console.log('diagramLocked', diagramLocked);
        if (diagramLocked) model.setLocked(diagramLocked);
        engine.setDiagramModel(model);
        addModelListeners(model);
        setAppState({
            loadingVersion: false,
            loadError: null,
            sirScaleId: sirScale.id,
            filterTypeId: selectedFilterType, 
            version,
            versions,
            description,
            diagramLocked,
        });
        this.setState(initialState);
    }

    handleOpenVersion = (version, onClose) => {
        const { setAppState } = this.props.context;
        const { selectedFilterType } = this.state;
        this.setState({ version, revisionIndex: 0 }, async () => {
            try {
                setAppState({ loadingVersion: true, loadError: null });
                // check if there was an unsaved revision of this version in the indexedDB
                const unsavedDefinition = await checkForUnsavedRevision(selectedFilterType, version);
                if (unsavedDefinition) {
                    this.setState({ unsavedDefinition });
                } else {
                    const definition = await this.loadFromServer();
                    log.trace('loading into diagram', definition);
                    this.loadIntoDiagram(definition);
                    onClose();
                }
            } catch (error) {
                setAppState({ loadingVersion: false, loadError: error.message });
            }
        });
    }

    handleFilterTypeChanged = async (e, { value }) => {
        const { setAppState } = this.props.context;
        const versions = await getFitlerTypeSIRScaleVersions(value, setAppState);
        log.trace('versions', versions);
        this.setState({ selectedFilterType: value, versions })
    }

    handleCancelUnsavedVersion = async () => {
        const definition = await this.loadFromServer();
        this.loadIntoDiagram(definition);
        this.setState({ unsavedDefinition: null });
        this.props.onClose();
    }

    handleConfirmUnsavedVersion = async () => {
        const serializedDiagram = await this.loadFromIndexedDB();
        this.loadIntoDiagram({ serializedDiagram });
        this.setState({ unsavedDefinition: null });
        this.props.onClose();
    }

    render() {
        const { open, onClose } = this.props;
        const { versions, selectedFilterType, unsavedDefinition } = this.state;
        const { filterTypes } = this.props.context.state;
        const filterTypeOptions = (filterTypes || []).map(ft => (
            { key: ft.code, text: ft.name, value: ft.id }
        ));
        if (unsavedDefinition !== null) {
            return (
                <Confirm
                    open={true}
                    onCancel={this.handleCancelUnsavedVersion}
                    onConfirm={this.handleConfirmUnsavedVersion}
                    cancelButton='Load from Server'
                    confirmButton="Load Unsaved Revision"
                    header='Recover Document'
                    content={(
                        <Container>
                            <p>There is an unsaved revision of this SIR scale diagram on this computer.</p>
                            <p>Would you like to load that version or load from the server?</p>
                        </Container>
                    )}
                />
            );
        }
        return (
            <Modal size="tiny" open={open} closeIcon onClose={onClose}>
                <Header icon='folder open outline' content='Open SIR Scale Version' />
                <Modal.Content>
                    <p>Start by choosing a Filter Type:</p>
                    <Select 
                        fluid
                        placeholder='Select the filter type'
                        options={filterTypeOptions}
                        onChange={this.handleFilterTypeChanged}
                    />
                    {selectedFilterType &&
                    <Segment style={{overflow: 'auto', height: '120px' }} attached>
                        <p>Select from the available versions:</p>
                        <List selection>
                            {(versions || []).map((version) => (
                                <List.Item key={version.version} onClick={() => this.handleOpenVersion(version.version, onClose)}>
                                    <List.Content floated="right">
                                        <Icon size="large" name="folder open" />
                                    </List.Content>
                                    <List.Content>
                                        <List.Header>{version.version}</List.Header>
                                        <List.Description>{version.description}</List.Description>
                                    </List.Content>
                                </List.Item>
                            ))}
                        </List>
                    </Segment>
                    }
                </Modal.Content>
                <Modal.Actions>
                    <Button secondary onClick={onClose}>Cancel</Button>
                </Modal.Actions>
            </Modal>
        );
    }

}

export default withAppContext(OpenVersion);
