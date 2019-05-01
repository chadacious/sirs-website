import * as _ from 'lodash';
import { log } from '@medlor/medlor-core-lib';

const generateDecisionTree = (model, node) => {
    const { name, type, extras: { code, description, shortName, message } } = node;
    const branch = {
        code,
        name,
        description,
        shortName,
        type,
    };

    // Now build the choices for this branch
    // choices correspond to out ports of the node
    _.keys(node.ports)
        .filter(portKey => node.ports[portKey].in === false)
        .forEach((portKey) => {
            const port = node.ports[portKey];
            const { extras: { code, sortOrder }, label: name } = port;
            const choice = port.extras.level ? {} : { code, name };
            if (sortOrder) choice.sortOrder = sortOrder;
            if (message) choice.message = message;
            if (shortName) choice.shortName = shortName;

            // Handle the typical scenario where this choice branches to another node
            _.keys(port.links).forEach((linkKey) => {
                const link = port.links[linkKey];
                const { extras } = port;
                const linkedNode = getTrueTargetNode(link);
                // const linkedNodeKey = _.keys(model.nodes).filter(nodeKey => nodeKey === link.id)[0]; // find the linked node
                // const linkedNode = model.nodes[linkedNodeKey];
                // If a outport's link includes a extras.level, then it marks the end of a decision tree.
                if (extras.level) {
                    choice.level = extras.level;
                    // console.log('extras', extras);
                    extras.items.forEach((item) => {
                        const { code, name, sortOrder } = item;
                        if (!choice.items) choice.items = [];
                        choice.items.push({ code, name, sortOrder });
                    });
                    // console.log(choice);
                }

                if (linkedNode) {
                    // console.log('linkedNode', linkedNode);
                    choice.branch = generateDecisionTree(model, linkedNode);
                }
            });

            if (!branch.choices) branch.choices = [];
            branch.choices.push(choice);
    });

    return branch;
};

const getTrueTargetNode = (link) => {
    // Check which of the two ports of the link are the In port. This represents the target
    // The reason we check is that the source and target ports depend on which direction the
    // link was originally created. Since we can't be sure that the user always created it from
    // Out to In, we'll check both, starting with the targetPort.
    return link.targetPort.in ? link.targetPort.parent : link.sourcePort.parent;
}

export const diagramToJson = (model) => {
    const jsonSIRScale = [];
    log.trace('model', model);
    // Iterate through entry nodes
    _.keys(model.nodes).filter(nodeKey => model.nodes[nodeKey].type === 'FilterType').forEach((nodeKey) => {
        const node = model.nodes[nodeKey];
        // these starting off nodes are representative of filter types
        // get the single linked node to this filter type to start off the recursive building of the decision tree
        const port = node.ports[_.keys(node.ports)[0]];
        const link = port.links[_.keys(port.links)[0]];
        // log.trace('port', port);
        // log.trace('link', link);
        const linkedNode = getTrueTargetNode(link);
        log.trace('starting with', linkedNode)
        const { extras: { code: filterType }, name } = node;
        const ft = {
            filterType,
            name,
            root: generateDecisionTree(model, linkedNode),
        };
        jsonSIRScale.push(ft);
    });
    log.trace('jsonSIRScale', jsonSIRScale);
    log.trace(JSON.stringify(jsonSIRScale));
    return jsonSIRScale;
};
