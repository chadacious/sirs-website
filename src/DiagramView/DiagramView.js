import React from 'react';
import { DiagramWidget, DiagramModel } from 'storm-react-diagrams'
import { EventSystem } from '@medlor/medlor-core-lib';

import { withAppContext } from '../AppContext';
import DiagramMenu from './DiagramMenu';
import {
    initializeDiagramEngine,
    getFilterTypes,
    handleModelChanged,
    saveSIRScale,
    getLatestRevision,
    getOldestRevision,
    getRevision,
    addModelListeners,
  } from './utils/diagram-utils';
import ZoomSlider from './DiagramTools/ZoomSlider';

import './DiagramView.css';

class DiagramView extends React.Component {
    componentDidMount() {
        const engine = initializeDiagramEngine();
        const { setAppState } = this.props.context;
        getFilterTypes(setAppState);
        setAppState({ diagramEngine: engine });
        EventSystem.subscribe('ZOOM_SLIDER', this.handleZoomSliderEvent);
        EventSystem.subscribe('MODEL_CHANGED_EVENT', this.handleModelChangedEvent);
        document.onkeydown = this.handleKeyPress.bind(this);
        this.revisionIndex = 0;
    }
  
    handleKeyPress = async (e) => {
        if ((e.keyCode === 90 || e.keyCode === 89) && e.ctrlKey) {
          const { filterTypeId, version } = this.props.context.state;
          if (filterTypeId && version) {
            // If we are not in a revision cycle, then only ctrl+x applies
            if (this.revisionIndex === 0 && e.keyCode === 90) {
                const latestRevision = await getLatestRevision(filterTypeId, version);
                this.revisionIndex = latestRevision.revision - 1;
            } else if (this.revisionIndex > 0) {
                const topRevision = await getLatestRevision(filterTypeId, version);
                const bottomRevision = await getOldestRevision(filterTypeId, version);
                if (e.keyCode === 90 && this.revisionIndex - 1 >= bottomRevision.revision) {
                    this.revisionIndex -= 1;
                } else if (e.keyCode === 89 && this.revisionIndex + 1 <= topRevision.revision) {
                    this.revisionIndex += 1;
                }
            }
            // console.log('loading revision', this.revisionIndex);
            const loadRevision = await getRevision(filterTypeId, version, this.revisionIndex);
            // console.log(loadRevision);
            if (loadRevision) {
                const model = new DiagramModel();
                const { diagramEngine: engine } = this.props.context.state;
                model.deSerializeDiagram(JSON.parse(loadRevision.jsonDefinition), engine);
                engine.setDiagramModel(model);
                addModelListeners(model);
                this.forceUpdate();
            }
          }
        }
        if (e.keyCode === 83 && e.ctrlKey) {
            e.preventDefault();
            const { diagramEngine, sirScaleId: id } = this.props.context.state;
            const jsonDefinition = JSON.stringify(diagramEngine.diagramModel.serializeDiagram());
            saveSIRScale(this.props.context, id, { jsonDefinition });
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