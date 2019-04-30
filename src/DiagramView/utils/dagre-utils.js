import * as dagre from "dagre";
import * as _ from "lodash";
// import { log } from '@medlor/medlor-core-lib';

const size = {
	width: 200,
	height: 100
};

export function distributeElements(model) {
	let clonedModel = _.cloneDeep(model);
	let nodes = distributeGraph(clonedModel);
	// log.trace(nodes);
	nodes.forEach(node => {
		let modelNode = clonedModel.nodes.find(item => item.id === node.id);
		modelNode.x = node.x - node.width / 2;
		// log.trace(modelNode.x, node.x, node.width, node.width / 2);
		modelNode.y = node.y - node.height / 2;
	});
	return clonedModel;
}

function distributeGraph(model) {
	let nodes = mapElements(model);
	let edges = mapEdges(model);
	// log.trace(nodes);
	let graph = new dagre.graphlib.Graph();
	graph.setGraph({});
	graph.setDefaultEdgeLabel(() => ({}));
	graph.graph().rankDir = 'LR';
	//add elements to dagre graph
	nodes.forEach(node => {
		graph.setNode(node.id, node.metadata);
	});
	edges.sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1).forEach(edge => {
		if (edge.from && edge.to) {
			graph.setEdge(edge.from, edge.to);
		}
	});
	//auto-distribute
	dagre.layout(graph);
	return graph.nodes().map(node => graph.node(node));
}

function getLinkSortOrder(model, link) {
	let sourcePort;
	model.nodes.filter(node => node.ports.forEach(port => { if (port.id === link.sourcePort) sourcePort = port; }));
	return (sourcePort || { extras: {} }).extras.sortOrder || 0;
}

// function getNodeSortOrder(model, node) {
// 	const nodeInPortLink = model.links.filter(link =>
// 			link.id === (((node.ports.filter(port => port.in)[0] || {}).links || [])[0]))[0];
// 	// log.trace('link found', nodeInPortLink);
// 	if (!nodeInPortLink) return 0;
// 	return getLinkSortOrder(model, nodeInPortLink);
// }

function mapElements(model) {
	// dagre compatible format
	// sort the nodes according to their linked 'in' port's sort order
	return model.nodes
		// .sort((a, b) => getNodeSortOrder(model, a) > getNodeSortOrder(model, b) ? -1 : 1)
		.map(node => {
			let nodeSize = size;
			const nodeDiv = document.querySelectorAll(`div.node.srd-node[data-nodeid="${node.id}"]`);
			if (nodeDiv.length === 1) {
				const rect = nodeDiv[0].getBoundingClientRect();
				nodeSize = { width: rect.width, height: rect.height };
			}
			// log.trace(node);
			return { id: node.id, metadata: { ...nodeSize, id: node.id } }; // , sortOrder: getNodeSortOrder(model, node)
	});
	// return model.nodes.map(node => ({ id: node.id, metadata: { ...size, id: node.id } }));
}

function mapEdges(model) {
	// returns links which connects nodes
	// we check are there both from and to nodes in the model. Sometimes links can be detached
	return model.links
		.map(link => ({
			from: link.source,
			to: link.target,
			sortOrder: getLinkSortOrder(model, link)
		}))
		.filter(
			item => model.nodes.find(node => node.id === item.from) && model.nodes.find(node => node.id === item.to)
		);
}
