// import * as _ from 'lodash';
import React from 'react';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import * as SRD from 'storm-react-diagrams'
import { EventSystem } from '@medlor/medlor-core-lib';

import { PortWithExtrasFactory } from '../DiagramElements/PortWithExtras/PortWithExtrasFactory';
import { PortWithExtrasModel } from '../DiagramElements/PortWithExtras/PortWithExtrasModel';

import { FilterTypeNodeFactory } from '../DiagramElements/FilterType/FilterTypeNodeFactory';
import { ButtonDecisionNodeFactory } from '../DiagramElements/ButtonDecision/ButtonDecisionNodeFactory';
import { MultipleChoiceNodeFactory } from '../DiagramElements/MultipleChoice/MultipleChoiceNodeFactory';
import { MessageNodeFactory } from '../DiagramElements/Message/MessageNodeFactory';
import { SIRLevelNodeFactory } from '../DiagramElements/SIRLevel/SIRLevelNodeFactory';

import { FilterTypeNodeModel } from '../DiagramElements/FilterType/FilterTypeNodeModel';
import { ButtonDecisionNodeModel } from '../DiagramElements/ButtonDecision/ButtonDecisionNodeModel';
import { MultipleChoiceNodeModel } from '../DiagramElements/MultipleChoice/MultipleChoiceNodeModel';
import { MessageNodeModel } from '../DiagramElements/Message/MessageNodeModel';
import { SIRLevelNodeModel } from '../DiagramElements/SIRLevel/SIRLevelNodeModel';

import db from '../../IndexedDB';
import SIRSClient from '../../SIRSClient';

export const levelColors = ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'red', 'brown', 'black'];

const allFilterTypes = gql`
    query {
        allFilterTypes {
            id
            code
            name
            description
        }
    }
`;
const getSIRScaleVersions = gql`
    query($filterTypeId: Int!) {
        getSIRScaleVersions(filterTypeId: $filterTypeId) {
            id
            filterTypeId
            version
            description
        }
    }
`;
const loadSIRScaleDefinition = gql`
    query($id: Int!) {
        loadSIRScaleDefinition(id: $id) {
            id
            filterTypeId
            version
            description
            jsonDefinition
        }
    }
`;
const upsertSIRScaleVersion = gql`
    mutation($id: Int!, $sirScaleVersionInput: SIRScaleVersionInput!) {
        SIRScale: upsertSIRScaleVersion (
            id: $id,
            sirScaleVersionInput: $sirScaleVersionInput
        ) {
            id
            ok
            errors {
                path
                message
            }
        }
    }
`;

const debounceHandleModelChangeEvents = _.debounce((e) => EventSystem.publish('MODEL_CHANGED_EVENT', e), 250);
export const modelChangeEvent = (e) => {
    // console.log('diagram change detected', e);
    debounceHandleModelChangeEvents(e);
};

export const addModelListeners = (model) => {
    model.addListener({
        nodesUpdated: modelChangeEvent,
        linksUpdated: modelChangeEvent,
        offsetUpdated: modelChangeEvent,
        zoomUpdated: modelChangeEvent,
        gridUpdated: modelChangeEvent,
        selectionChanged: modelChangeEvent,
        entityRemoved: modelChangeEvent,
    });
};

export const prepareNewModel = () => {
    const model = new SRD.DiagramModel();
    addModelListeners(model);
    return model;
}

export const initializeDiagramEngine = () => {
    const engine = new SRD.DiagramEngine();
    engine.installDefaultFactories();
    engine.registerPortFactory(new PortWithExtrasFactory("PortWithExtras", config => new PortWithExtrasModel()));
    engine.registerNodeFactory(new FilterTypeNodeFactory());
    engine.registerNodeFactory(new ButtonDecisionNodeFactory());
    engine.registerNodeFactory(new MultipleChoiceNodeFactory());
    engine.registerNodeFactory(new MessageNodeFactory());
    engine.registerNodeFactory(new SIRLevelNodeFactory());
    const model = prepareNewModel();
    engine.setDiagramModel(model);
    return engine;
};

export const getFilterTypes = (setAppState) => {
    SIRSClient.query({ query: allFilterTypes }).then((res) => {
        // console.log(res.data.allFilterTypes);
        setAppState({ filterTypes: res.data.allFilterTypes });
    });
};

export const getFitlerTypeSIRScaleVersions = (filterTypeId, setAppState) => {
    SIRSClient.query({
        query: getSIRScaleVersions,
        variables: { filterTypeId },
        fetchPolicy: 'network-only'
    }).then((res) => {
        // console.log(res.data.allFilterTypes);
        setAppState({ versions: res.data.getSIRScaleVersions });
    });
};

export const getSIRScaleDefinition = async (id) => {
    const res = await SIRSClient.query({
        query: loadSIRScaleDefinition,
        variables: { id },
        fetchPolicy: 'network-only'
    });
    return res.data.loadSIRScaleDefinition;
};

export const saveSIRScale = (context, id, sirScaleVersionInput) => {
    // console.log('upserting', sirScaleVersionInput);
    if (!id) return;
    const { setAppState } = context;
    const { filterTypeId, version } = sirScaleVersionInput;
    setAppState({ savingVersion: true, saveError: null });
    SIRSClient.mutate({
        mutation: upsertSIRScaleVersion,
        variables: { id, sirScaleVersionInput },
    }).then((res) => {
        const { ok, errors, id } = res.data.SIRScale;
        if (!ok) {
            setAppState({ savingVersion: false, saveError: errors[0].message });
            // throw new Error(`There was an error saving the data: upsertSIRScaleVersion: ${errors[0].message}`);
        } else {
            // console.log(res.data.allFilterTypes);
            let loadVersionToState = {};
            if (filterTypeId && version) {
                loadVersionToState = {
                    filterTypeId, 
                    version,
                };
            }
            setAppState({
                savingVersion: false,
                saveError: null,
                sirScaleId: id,
                ...loadVersionToState,
            });
            // indicate that we have saved the latest entry
            handleModelChanged({ id: 'saveSIRScale' }, context, true);
        }
    });
};

export const getLatestRevision = async (filterTypeId, version) => {
    return db.diagram.where(['filterTypeId', 'version', 'revision'])
        .between([filterTypeId, version, 0], [filterTypeId, version, Number.MAX_SAFE_INTEGER], true, true)
        .last();
}

export const getOldestRevision = async (filterTypeId, version) => {
    return db.diagram.where(['filterTypeId', 'version', 'revision'])
        .between([filterTypeId, version, 0], [filterTypeId, version, Number.MAX_SAFE_INTEGER], true, true)
        .first();
}

export const getRevision = async (filterTypeId, version, revision) => {
    return db.diagram.where({ filterTypeId, version, revision }).first();
}

export const checkForUnsavedRevision = async (filterTypeId, version) => {
    const lastEntry = await getLatestRevision(filterTypeId, version);
    if (!lastEntry.savedToServer) {
        return lastEntry.jsonDefinition;
    }
    return false;
}

export const handleModelChanged = (e, context, savedToServer = false) => {
    const { diagramEngine: engine, filterTypeId, version } = context.state;
    if (!filterTypeId || !version) return;
    const jsonDefinition = JSON.stringify(engine.diagramModel.serializeDiagram());
    // console.log('model changed', jsonDefinition);
    getLatestRevision(filterTypeId, version).then((lastEntry) => {
        const nextRevision = (lastEntry || { revision: 0 }).revision + 1
        db.diagram.put({
            filterTypeId,
            version,
            revision: nextRevision,
            jsonDefinition: jsonDefinition,
            savedToServer,
        });
        // delete oldest revisions
        db.diagram.where(['filterTypeId', 'version', 'revision'])
        .between([filterTypeId, version, 0], [filterTypeId, version, Number.MAX_SAFE_INTEGER], true, true)
        .first((oldestEntry) => {
            const oldestRevision = oldestEntry.revision;
            if (oldestEntry.revision < nextRevision - 25) {
            db.diagram.where({ filterTypeId, version, revision: oldestRevision }).delete();
            }
        });
    });
};

/**
 * When a node is added, we'll set up the proper node model and define the needed default ports
 * @param {*} model 
 * @param {*} nodeType 
 */
export const addNode = (model, nodeType) => {
    // console.log(nodeType);
    if (nodeType === 'FilterType') {
        const node = new FilterTypeNodeModel('No Name', "mediumaquamarine");
        node.setPosition(100, 100);
        node.addOutPort("Out").extras.code = "OUT";
        model.addNode(node)
    } else if (nodeType === 'ButtonDecision') {
        const node = new ButtonDecisionNodeModel('No Name', "green");
        node.setPosition(175, 100);
        node.addInPort("In").extras.code = "IN";
        node.addOutPort("Yes");
        node.addOutPort("No");
        model.addNode(node)
    } else if (nodeType === 'MultipleChoice') {
        const node = new MultipleChoiceNodeModel('No Name', "yellow");
        node.setPosition(175, 100);
        node.addInPort("In").extras.code = "IN";
        node.addOutPort("Choice 1");
        node.addOutPort("Choice 2");
        model.addNode(node)
    } else if (nodeType === 'Message') {
        const node = new MessageNodeModel('No Heading', "orange");
        node.setPosition(255, 100);
        node.addInPort("In").extras.code = "IN";
        model.addNode(node)
    } else if (nodeType === 'SIRLevel') {
        const node = new SIRLevelNodeModel('Unknown Level', "grey");
        node.setPosition(425, 100);
        node.addInPort("In").extras.code = "IN";
        model.addNode(node)
    }
};

export const updateOutPortItemLabel = (outPort) => {
    let newLabel = '';
    const labelItems = [];
    (outPort.extras.items || []).sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
        .forEach((item) => {
            labelItems.push(
                <div key={item.code}>
                    <div className='checkbox-box' style={{ backgroundColor: levelColors[outPort.extras.level] }} />
                    <span className='checkbox-explanation'>{item.name || item.code}</span><br />
                </div>
            );
        });
    outPort.label = <div>{labelItems.map(label => label)}</div>;
    newLabel = outPort.label
    return newLabel;
};

export const buildDiagramTitle = (context) => {
    const { filterTypes, filterTypeId, version } = context.state;
    // console.log(context.state);
    const filterTypeName = filterTypes.filter(ft => ft.id === filterTypeId)[0].name;
    const versionNumber = version;
    return `${filterTypeName} v${versionNumber}`; 
};
