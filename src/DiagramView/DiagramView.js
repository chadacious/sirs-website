import React from 'react';
import { DiagramWidget } from 'storm-react-diagrams'

import { withAppContext } from '../AppContext';
import DiagramMenu from './DiagramMenu';
import { initializeDiagramEngine } from './utils/diagram-utils';

import './DiagramView.css';

class DiagramView extends React.Component {
    componentDidMount() {
        const engine = initializeDiagramEngine();
        const { setAppState } = this.props.context;
        setAppState({ diagramEngine: engine });
    
    }

    render() {
        const { context: { state: { diagramEngine } } } = this.props;
        return (
            <div>
                <DiagramMenu diagramEngine={diagramEngine} />
                {diagramEngine &&
                    <DiagramWidget
                        className="srd-canvas"
                        inverseZoom
                        // smartRouting={true}
                        diagramEngine={diagramEngine}
                    />
                }
            </div>
        );
    }
}

export default withAppContext(DiagramView);