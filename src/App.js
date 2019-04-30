import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Icon } from 'semantic-ui-react';
import { log } from '@medlor/medlor-core-lib';

import AppContext from './AppContext';
import DiagramView from './DiagramView';
import SIRSClient from './SIRSClient';
import { buildDiagramTitle } from './DiagramView/utils/diagram-utils';
import 'semantic-ui-css/semantic.min.css';
import 'storm-react-diagrams/dist/style.min.css';
import 'react-toastify/dist/ReactToastify.css';
import NotFound from './NotFound';

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

  checkIfWasRedirected = () => {
    /* Check for redirect in search string only if pathname starts with /signup (otherwise let main medlor page handle redirect) */
    if (window.location.search && window.location.pathname.match('/sirs')) {
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get('redirectTo');
        log.trace('from sirs website', myParam, `${window.location.origin}${myParam}`);
        return myParam;
    }
    return null;
}


  render() {
    const redirectTo = this.checkIfWasRedirected();
        
    return (
      <ApolloProvider client={SIRSClient}>
        <AppContext.Provider value={{ state: this.state, setAppState: this.setAppState }}>
          <BrowserRouter>
            {redirectTo && <Redirect to={redirectTo} />}
            <Switch>
              {window.location.host === 'localhost:3002' &&
                  <Route path="/" exact component={() => <Redirect to="/sirs" />} />
              }
              <Route path="/sirs" exact component={() => (<div><div>Sirs Stub</div><a href="/sirs/diagram-editor">Click Here</a></div>)} />
              <Route path="/sirs/diagram-editor" exact component={DiagramView} />
              <Route path="/sirs/*" component={NotFound} />
              <Route
                  path="/"
                  component={() => {
                      if (localStorage.getItem('redirectingTo') !== 'medlor-website') {
                          localStorage.setItem('redirectingTo', 'medlor-website');
                          window.location.reload(true); // force server request
                          return null;
                      }
                      localStorage.removeItem('redirectingTo');
                      return <div>Directing to main site...</div>;
                  }}
              />
            </Switch>
          </BrowserRouter>
        </AppContext.Provider>
        <ToastContainer />
      </ApolloProvider>
    );
  }
}

export default App;
