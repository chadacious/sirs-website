import React from 'react'
import { Button, Header, Icon, Modal, List } from 'semantic-ui-react'
import { withAppContext } from '../../AppContext';
import { initializeDiagramEngine } from '../utils/diagram-utils';

// import { generateModel, addNodeListeners } from '../../utils/sirScaleToDiagram';
// import { ProcessNodeModel } from '../ProcessNode/ProcessNodeModel';
// import { ProcessNodeFactory } from '../ProcessNode/ProcessNodeFactory';
// import db from '../../IndexedDB';

// import sampleTree from '../sample.json';

const handleOpenVersion = (version, context, onClose) => {
    const { setAppState } = context;
    // const jsonSIRScale = sampleTree; // temp
    const engine = initializeDiagramEngine();
    setAppState({ diagramEngine: engine, version });
    onClose();
    // db.diagram.where({ version }).first((versionDetails) => {
    //     // console.log(versionDetails.version);
    //     console.log(JSON.parse(versionDetails.jsonDiagram));
    //     // console.log(context);
    //     const { diagramEngine } = context.state;
    //     const model = new SRD.DiagramModel();
    //     // model.deSerializeDiagram(JSON.parse(versionDetails.jsonDiagram), diagramEngine);
    //     model.deSerializeDiagram(diagramEngine.diagramModel.serializeDiagram());
    //     diagramEngine.setDiagramModel(model);
    //     context.setAppState({ diagramEngine });
    //     onClose();
    // });
};

const OpenVersion = ({ open, versions, onClose, context }) => (
    <Modal size="tiny" open={open} closeIcon onClose={onClose}>
        <Header icon='folder open outline' content='Open SIR Scale Version' />
        <Modal.Content>
            <p>
                Select from the available versions:
            </p>
            <List selection>
                {versions.map((version) => (
                    <List.Item key={version.version} onClick={() => handleOpenVersion(version.version, context, onClose)}>
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
        </Modal.Content>
        <Modal.Actions>
            <Button primary onClick={onClose}>
                <Icon name='plus' /> New
            </Button>
        </Modal.Actions>
    </Modal>
);

export default withAppContext(OpenVersion);
