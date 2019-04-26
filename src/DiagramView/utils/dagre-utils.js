import * as dagre from "dagre";
import * as _ from "lodash";

const size = {
	width: 200,
	height: 100
};

export function distributeElements(model) {
	let clonedModel = _.cloneDeep(model);
	let nodes = distributeGraph(clonedModel);
	nodes.forEach(node => {
		let modelNode = clonedModel.nodes.find(item => item.id === node.id);
		modelNode.x = node.x - node.width / 2;
		modelNode.y = node.y - node.height / 2;
	});
	return clonedModel;
}

function distributeGraph(model) {
	let nodes = mapElements(model);
	let edges = mapEdges(model);
	let graph = new dagre.graphlib.Graph();
	graph.setGraph({});
	graph.setDefaultEdgeLabel(() => ({}));
	graph.graph().rankDir = 'LR';
	//add elements to dagre graph
	nodes.forEach(node => {
		graph.setNode(node.id, node.metadata);
	});
	edges.forEach(edge => {
		if (edge.from && edge.to) {
			graph.setEdge(edge.from, edge.to);
		}
	});
	//auto-distribute
	dagre.layout(graph);
	return graph.nodes().map(node => graph.node(node));
}

function mapElements(model) {
	// dagre compatible format
	return model.nodes.map(node => {
		let nodeSize = size;
		const nodeDiv = document.querySelectorAll(`div.node.srd-node[data-nodeid="${node.id}"]`);
		if (nodeDiv.length === 1) {
			const rect = nodeDiv[0].getBoundingClientRect();
			nodeSize = { width: rect.width, height: rect.height };
		}
		// console.log(node);
		return { id: node.id, metadata: { ...nodeSize, id: node.id } };
	});
	// return model.nodes.map(node => ({ id: node.id, metadata: { width: node.width, height: node.height, id: node.id } }));
}

function mapEdges(model) {
	// returns links which connects nodes
	// we check are there both from and to nodes in the model. Sometimes links can be detached
	return model.links
		.map(link => ({
			from: link.source,
			to: link.target
		}))
		.filter(
			item => model.nodes.find(node => node.id === item.from) && model.nodes.find(node => node.id === item.to)
		);
}
