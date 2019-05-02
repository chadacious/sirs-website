import React from 'react';
import { DiagramWidget } from 'storm-react-diagrams'
import { EventSystem } from '@medlor/medlor-core-lib';

import { withAppContext } from '../AppContext';
import DiagramMenu from './DiagramMenu';
import {
    initializeDiagramEngine,
    getFilterTypes,
    handleModelChanged,
    saveSIRScale,
    processUndoRedoAction,
  } from './utils/diagram-utils';
import ZoomSlider from './DiagramTools/ZoomSlider';

import './DiagramView.css';

class DiagramView extends React.Component {
    componentDidMount() {
        const engine = initializeDiagramEngine();
        const { setAppState } = this.props.context;
        getFilterTypes(setAppState);
        setAppState({ diagramEngine: engine, revisionIndex: 0 });
        EventSystem.subscribe('ZOOM_SLIDER', this.handleZoomSliderEvent);
        EventSystem.subscribe('MODEL_CHANGED_EVENT', this.handleModelChangedEvent);
        document.onkeydown = this.handleKeyPress.bind(this);
    }
  
    handleKeyPress = async (e) => {
        // undo/redo
        if ((e.keyCode === 90 || e.keyCode === 89) && e.ctrlKey) {
            processUndoRedoAction(this.props.context, e);
        }
        // save
        if (e.keyCode === 83 && e.ctrlKey) {
            e.preventDefault();
            const { diagramEngine, sirScaleId: id } = this.props.context.state;
            const serializedDiagram = JSON.stringify(diagramEngine.diagramModel.serializeDiagram());
            saveSIRScale(this.props.context, id, { serializedDiagram });
        }
    }
    
    handleModelChangedEvent = (e) => {
        handleModelChanged(e, this.props.context);
        if (e.entity) {
            const { state: { diagramEngine: engine }, setAppState } = this.props.context;
            // console.log(e.entity.zoom);
            setAppState({ diagramEngine: engine });
        }
    }
    
    handleZoomSliderEvent = (values) => {
        const { state: { diagramEngine: engine }, setAppState } = this.props.context;
        // console.log(values, engine.diagramModel.getZoomLevel());
        engine.diagramModel.setZoomLevel(values[0]);
        setAppState({ diagramEngine: engine });
    }

    handleZoomToFitClick = ()  => {
        const { state: { diagramEngine: engine }, setAppState } = this.props.context;
        engine.zoomToFit();
        engine.diagramModel.setOffset(50, 100);
        setAppState({ diagramEngine: engine });
    }

    handleZoom = (direction) => {
        const { state: { diagramEngine: engine }, setAppState } = this.props.context;
        engine.diagramModel.setZoomLevel(engine.diagramModel.getZoomLevel() + direction);
        setAppState({ diagramEngine: engine });
    }

    render() {
        const { context: { state: { diagramEngine: engine } } } = this.props;
        return (
            <div>
                <DiagramMenu diagramEngine={engine} />
                {engine &&
                    <DiagramWidget
                        className="srd-canvas"
                        inverseZoom
                        maxNumberPointsPerLink={0}
                        diagramEngine={engine}
                    />
                }
                <ZoomSlider
                    values={engine && engine.diagramModel && engine.diagramModel.getZoomLevel ? [engine.diagramModel.getZoomLevel() || 100] : [100]}
                    onZoomToFit={this.handleZoomToFitClick}
                    onZoomOut={() => this.handleZoom(-1)}
                    onZoomIn={() => this.handleZoom(1)}
                />
            </div>
        );
    }
}

export default withAppContext(DiagramView);