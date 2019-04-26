import React from 'react';

const AppContext = React.createContext();

export const withAppContext = Component => (
    props => (
        <AppContext.Consumer>
            {context => <Component {...props} context={context} />}
        </AppContext.Consumer>
    )
);

export default AppContext;
