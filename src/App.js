import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ToastContainer, toast } from 'react-toastify';
import { Icon } from 'semantic-ui-react';

import AppContext from './AppContext';
import DiagramView from './DiagramView';
import SIRSClient from './SIRSClient';
import { buildDiagramTitle } from './DiagramView/utils/diagram-utils';
import 'semantic-ui-css/semantic.min.css';
import 'storm-react-diagrams/dist/style.min.css';
import 'react-toastify/dist/ReactToastify.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      version: null,
    };
    this.setAppState = this.setAppState.bind(this);
  }

  checkForToasts = (newState) => {
    if (this.state.loadingVersion && !newState.loadingVersion) {
      if (newState.loadError) {
        toast.error(<div><Icon size="large" name="exclamation" />{`Load Error: ${newState.loadError}`}</div>, { position: toast.POSITION.BOTTOM_RIGHT });
      } else {
        const title = buildDiagramTitle({ setAppSate: this.setAppState, state: { ...this.state, ...newState } });
        toast.info(<div><Icon size="large" name="check" />{`Loaded: ${title}`}</div>, { position: toast.POSITION.BOTTOM_RIGHT });
      }
    }
    if (this.state.savingVersion && !newState.savingVersion) {
      if (newState.saveError) {
        toast.error(<div><Icon size="large" name="exclamation" />{`Save Error: ${newState.saveError}`}</div>, { position: toast.POSITION.BOTTOM_RIGHT });
      } else {
        const title = buildDiagramTitle({ setAppSate: this.setAppState, state: { ...this.state, ...newState } });
        toast.success(<div><Icon size="large" name="save outline" />{`Save Complete: ${title}`}</div>, { position: toast.POSITION.BOTTOM_RIGHT });
      }
    }
  }

  /* Set the AppContext state */
  setAppState(newState) {
    this.checkForToasts(newState);
    this.setState(newState);
  }

  render() {
    return (
      <ApolloProvider client={SIRSClient}>
        <AppContext.Provider value={{ state: this.state, setAppState: this.setAppState }}>
          <DiagramView />
        </AppContext.Provider>
        <ToastContainer />
      </ApolloProvider>
    );
  }
}

export default App;
