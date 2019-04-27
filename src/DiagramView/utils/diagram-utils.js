// import * as _ from 'lodash';
import React from 'react';
import * as SRD from 'storm-react-diagrams'
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

export const levelColors = ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'red', 'brown', 'black'];

export const initializeDiagramEngine = () => {
    const engine = new SRD.DiagramEngine();
    engine.installDefaultFactories();
    engine.registerPortFactory(new PortWithExtrasFactory("PortWithExtras", config => new PortWithExtrasModel()));
    engine.registerNodeFactory(new FilterTypeNodeFactory());
    engine.registerNodeFactory(new ButtonDecisionNodeFactory());
    engine.registerNodeFactory(new MultipleChoiceNodeFactory());
    engine.registerNodeFactory(new MessageNodeFactory());
    engine.registerNodeFactory(new SIRLevelNodeFactory());
    const model = new SRD.DiagramModel();
    engine.setDiagramModel(model);

    // const ftnode = new FilterTypeNodeModel('ft.name', "mediumaquamarine");
    // ftnode.setPosition(100, 100);
    // const ftport = ftnode.addOutPort("Out");
    // model.addNode(ftnode);

    return engine;
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
