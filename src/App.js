import React from 'react';
import AppContext from './AppContext';
import DiagramView from './DiagramView';
// import db from './IndexedDB';
import 'semantic-ui-css/semantic.min.css';
import 'storm-react-diagrams/dist/style.min.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      version: null,
      // jsonSIRScale: null,
      // gridView: {},
      // handleSelectionChanged: this.handleSelectionChanged,
      // handleGridViewChange: this.handleGridViewChange,
    };
    this.setAppState = this.setAppState.bind(this);
  }

  /* Set the AppContext state */
  setAppState(newState) {
    console.log('newState', newState);
    // const version = this.state.version || newState.version;
    // console.log(newState);
    // if (version) {
    //   if (newState.diagramEngine ) {
    //     // rebuild the jsonSIRScale from the latest diagram
    //     // console.log('should update sirscale');
    //     const jsonSIRScale = generateSIRScale(newState.diagramEngine.diagramModel);
    //     if (jsonSIRScale) {
    //       newState = { ...newState, jsonSIRScale };
    //       // console.log('updating jsonSirScale', jsonSIRScale)
    //       // console.log(newState.diagramEngine.diagramModel.serializeDiagram());
    //       db.diagram.put({
    //         version,
    //         jsonDiagram: JSON.stringify(jsonSIRScale),
    //       });
    //     }
    //   } else if (newState.jsonSIRScale) {
    //     const model = new SRD.DiagramModel();
    //     this.restoreGridPosition(model);
    //     generateModel(model, newState.jsonSIRScale);
    //     addNodeListeners(model, this.state);
    //     (newState.diagramEngine || this.state.diagramEngine).setDiagramModel(model);

    //     // this.state.diagramEngine.repaintCanvas();
    //     // console.log('regenerated');
    //     // this.forceUpdate();
    //     // console.log(newState.jsonSIRScale);
    //     db.diagram.put({
    //       version,
    //       jsonSIRScale: JSON.stringify(newState.jsonSIRScale),
    //     });
    //   }
    // }
    this.setState(newState);
  }

  render() {
    return (
      <AppContext.Provider value={{ state: this.state, setAppState: this.setAppState }}>
        <DiagramView />
      </AppContext.Provider>
    );
  }
}

export default App;
