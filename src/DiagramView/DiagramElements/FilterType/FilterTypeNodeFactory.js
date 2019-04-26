import * as SRD from 'storm-react-diagrams';
import { FilterTypeNodeWidget } from './FilterTypeNodeWidget';
import { FilterTypeNodeModel } from './FilterTypeNodeModel';
import * as React from 'react';

export class FilterTypeNodeFactory extends SRD.AbstractNodeFactory {
	constructor() {
		super('FilterType');
	}

	generateReactWidget(diagramEngine, node) {
		return <FilterTypeNodeWidget node={node} />;
	}

	getNewInstance() {
		return new FilterTypeNodeModel();
	}
}
