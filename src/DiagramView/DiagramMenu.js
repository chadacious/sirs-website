import React, { Component } from 'react'
import { Menu, Dropdown, Button } from 'semantic-ui-react'
import * as SRD from 'storm-react-diagrams'
import { distributeElements } from "./utils/dagre-utils";
import { withAppContext } from '../AppContext';
import OpenVersion from './Dialogs/OpenVersion';
import { addNode } from './utils/diagram-utils';

// import { addNodeListeners } from '../utils/sirScaleToDiagram';

class DiagramMenu extends Component {
  state = {
    openVersionDialog: false,
    versions: [
      { version: '0.1.0', description: 'initial commit' }
    ],
  };

  handleOpenVersionDialogClick = () => {
    this.setState({ openVersionDialog: true });
  }

  handleSaveVersionClick = () => {
    const { setAppState, state: { diagramEngine } } = this.props.context;
    setAppState({ diagramEngine });
  }

  handleNewNode = (nodeType) => {
    const { setAppState, state: { diagramEngine, diagramEngine: { diagramModel: model } } } = this.props.context;
    addNode(model, nodeType)
    setAppState({ diagramEngine });
  }

  handleAutoLayoutClick = ()  => {
    const { state: { diagramEngine: engine }, setAppState } = this.props.context;
    const model = engine.getDiagramModel();
    let distributedModel = this.getDistributedModel(engine, model);
    engine.clearRepaintEntities();
    engine.setDiagramModel(distributedModel);
    setAppState({ diagramEngine: engine });
  }

  handleZoomToFitClick = ()  => {
    const { state: { diagramEngine: engine }, setAppState } = this.props.context;
    engine.zoomToFit();
    setAppState({ diagramEngine: engine });
  }

  handleClose = () => {
    this.setState({ openVersionDialog: false });
  }

  getDistributedModel(engine, model) {
    const serialized = model.serializeDiagram();
    const distributedSerializedDiagram = distributeElements(serialized);

    //deserialize the model
    let deSerializedModel = new SRD.DiagramModel();
    deSerializedModel.deSerializeDiagram(distributedSerializedDiagram, engine);
    return deSerializedModel;
  }

  render() {
    const { openVersionDialog, versions } = this.state

    return (
      <React.Fragment>
        <Menu style={{ position: 'absolute', zIndex: 100, minWidth: '100vw' }}>
          <Dropdown item text='File'>
            <Dropdown.Menu>
              <Dropdown.Item onClick={this.handleNewVersionDialogClick}>New Version</Dropdown.Item>
              <Dropdown.Item onClick={this.handleOpenVersionDialogClick}>Open Version</Dropdown.Item>
              <Dropdown.Item onClick={this.handleSaveVersionClick}>Save Version</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>Publish Version</Dropdown.Item>
              <Dropdown.Item>Version Properties</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>Exit</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown item text='Add Node'>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => this.handleNewNode('FilterType')}>Filter Type Node</Dropdown.Item>
                <Dropdown.Item onClick={() => this.handleNewNode('ButtonDecision')}>Button Decision Node</Dropdown.Item>
                <Dropdown.Item onClick={() => this.handleNewNode('MultipleChoice')}>Multiple Choice Node</Dropdown.Item>
                <Dropdown.Item onClick={() => this.handleNewNode('Message')}>Message Node</Dropdown.Item>
                <Dropdown.Item onClick={() => this.handleNewNode('SIRLevel')}>SIR Level Node</Dropdown.Item>
              </Dropdown.Menu>
          </Dropdown>
          <Dropdown item text='Tools'>
            <Dropdown.Menu>
              <Dropdown.Item onClick={this.handleAutoLayoutClick}>Auto-Layout</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={this.handleZoomToFitClick}>Zoom-to-Fit</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Menu.Menu position='right'>
            <Menu.Item>
              <Button primary>Log In</Button>
            </Menu.Item>
          </Menu.Menu>
        </Menu>

        <OpenVersion versions={versions} open={openVersionDialog} onClose={this.handleClose} />
      </React.Fragment>
    )
  }
}

export default withAppContext(DiagramMenu);
