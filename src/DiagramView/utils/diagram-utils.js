import * as _ from 'lodash';
import * as SRD from 'storm-react-diagrams'
import { PortWithExtrasFactory } from '../DiagramElements/PortWithExtras/PortWithExtrasFactory';
import { PortWithExtrasModel } from '../DiagramElements/PortWithExtras/PortWithExtrasModel';
import { FilterTypeNodeFactory } from '../DiagramElements/FilterType/FilterTypeNodeFactory';
import { ButtonDecisionNodeFactory } from '../DiagramElements/ButtonDecision/ButtonDecisionNodeFactory';
import { FilterTypeNodeModel } from '../DiagramElements/FilterType/FilterTypeNodeModel';
import { ButtonDecisionNodeModel } from '../DiagramElements/ButtonDecision/ButtonDecisionNodeModel';

export const initializeDiagramEngine = () => {
    const engine = new SRD.DiagramEngine();
    engine.installDefaultFactories();
    engine.registerPortFactory(new PortWithExtrasFactory("PortWithExtras", config => new PortWithExtrasModel()));
    engine.registerNodeFactory(new FilterTypeNodeFactory());
    engine.registerNodeFactory(new ButtonDecisionNodeFactory());
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
    if (nodeType === 'FilterType') {
        const node = new FilterTypeNodeModel('No Name', "grey");
        node.setPosition(100, 100);
        node.addOutPort("Out");
        model.addNode(node)
    } else if (nodeType === 'ButtonDecision') {
        const node = new ButtonDecisionNodeModel('No Name', "green");
        node.setPosition(175, 100);
        node.addInPort("In");
        node.addOutPort("Yes");
        node.addOutPort("No");
        model.addNode(node)
    }
};

export const getOutPorts = (node) => getPorts(node, false);
export const getInPorts = (node) => getPorts(node, true);

export const getPorts = (node, inPort) => {
    return _.keys(node.ports)
        .filter(portKey => node.ports[portKey].in === inPort)
            .map(portKey => node.ports[portKey]);
};

export const getNodePortById = (node, portId) => {
    const portKey = _.keys(node.ports).filter(portKey => node.ports[portKey].id === portId)[0]
    return node.ports[portKey];
};

export const getOutLinks = (node) => getLinks(node, false);
export const getInLinks = (node) => getLinks(node, true);

export const getLinks = (node, inPort) => {
    return _.keys(node.ports)
        .filter(portKey => node.ports[portKey].in === inPort)
            .map(portKey => _.keys(node.ports[portKey].links)
                .map(linkKey => node.ports[portKey].links[linkKey]));
};
