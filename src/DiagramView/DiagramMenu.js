import React, { Component } from 'react'
import { Menu, Dropdown, Button, Modal } from 'semantic-ui-react'
import * as SRD from 'storm-react-diagrams'
import { distributeElements } from "./utils/dagre-utils";
import { withAppContext } from '../AppContext';
import OpenVersion from './Dialogs/OpenVersion';
import NewVersion from './Dialogs/NewVersion';

import { addNode, saveSIRScale } from './utils/diagram-utils';
import { LoginForm } from '@medlor/medlor-auth-lib';
import { loadUser, logOut } from '../actions/userActions';

// import { addNodeListeners } from '../utils/sirScaleToDiagram';

class DiagramMenu extends Component {
  state = {
    openVersionDialog: false,
    newVersionDialog: false,
    showLogin: false,
    loginActive: null, // will become false once we have mounted and checked authenticated
  };

  componentDidMount() {
    this.checkAuthenticated();
  }

  handleNewVersionDialogClick = () => {
    this.setState({ newVersionDialog: true });
  }

  handleOpenVersionDialogClick = () => {
    this.setState({ openVersionDialog: true });
  }

  handleSaveVersionClick = () => {
    const { state: { diagramEngine, sirScaleId: id } } = this.props.context;
    const jsonDefinition = JSON.stringify(diagramEngine.diagramModel.serializeDiagram());
    saveSIRScale(this.props.context, id, { jsonDefinition });
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
    engine.diagramModel.setOffset(50, 100);
    setAppState({ diagramEngine: engine });
  }

  handleClose = () => {
    this.setState({ openVersionDialog: false, newVersionDialog: false });
  }

  handleLogin = () => {
    this.checkAuthenticated();
  }

  handleLogout = () => {
    logOut().then((user) => {
      const { setAppState } = this.props.context;
      setAppState({ user });
    });
  }

  getDistributedModel(engine, model) {
    const serialized = model.serializeDiagram();
    const distributedSerializedDiagram = distributeElements(serialized);

    //deserialize the model
    let deSerializedModel = new SRD.DiagramModel();
    deSerializedModel.deSerializeDiagram(distributedSerializedDiagram, engine);
    return deSerializedModel;
  }

  checkAuthenticated() {
    loadUser()
      .then((user) => {
        this.setState({ loginActive: false });
        const { setAppState } = this.props.context;
        setAppState({ user });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loginActive: false });
      });
  }

  render() {
    const { openVersionDialog, newVersionDialog, loginActive } = this.state
    const { user, savingVersion, loadingVersion, version } = this.props.context.state;
    const saveButtonEnabled = () => (user && version);
    return (
      <React.Fragment>
        <Menu style={{ position: 'absolute', zIndex: 100, minWidth: '100vw' }}>
          <Dropdown disabled={!user} item text='File'>
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
          <Dropdown disabled={!user} item text='Add Node'>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => this.handleNewNode('FilterType')}>Filter Type Node</Dropdown.Item>
                <Dropdown.Item onClick={() => this.handleNewNode('ButtonDecision')}>Button Decision Node</Dropdown.Item>
                <Dropdown.Item onClick={() => this.handleNewNode('MultipleChoice')}>Multiple Choice Node</Dropdown.Item>
                <Dropdown.Item onClick={() => this.handleNewNode('Message')}>Message Node</Dropdown.Item>
                <Dropdown.Item onClick={() => this.handleNewNode('SIRLevel')}>SIR Level Node</Dropdown.Item>
              </Dropdown.Menu>
          </Dropdown>
          <Dropdown disabled={!user} item text='Tools'>
            <Dropdown.Menu>
              <Dropdown.Item onClick={this.handleAutoLayoutClick}>Auto-Layout</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={this.handleZoomToFitClick}>Zoom-to-Fit</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Menu.Menu position='right'>
            <Menu.Item fitted style={{ paddingRight: '1em' }}>
              {savingVersion && 'Saving...'}
              {loadingVersion && 'Loading...'}
            </Menu.Item>
            <Menu.Item>
              <Button disabled={!saveButtonEnabled()} primary onClick={this.handleSaveVersionClick}>Save</Button>
            </Menu.Item>
            <Menu.Item>
              {!user &&
                <Button primary loading={loginActive === null} onClick={() => this.setState({ loginActive: true })}>Log In</Button>
              }
              {user && <Button secondary onClick={this.handleLogout}>Log Out</Button>}
              <Modal
                open={loginActive}
                closeOnDimmerClick={false}
                onClose={() => this.setState({ loginActive: false })}
                size="mini"
                closeIcon
              >
                <Modal.Content>
                  <LoginForm
                    onForgotPassword={() => {}}
                    onNewAccount={() => {}}
                    onLogin={this.handleLogin}
                    template="simple"
                    minimalistic
                  />
                </Modal.Content>
              </Modal>
            </Menu.Item>
          </Menu.Menu>
        </Menu>

        <NewVersion open={newVersionDialog} onClose={this.handleClose} />
        <OpenVersion open={openVersionDialog} onClose={this.handleClose} />
      </React.Fragment>
    )
  }
}

export default withAppContext(DiagramMenu);
