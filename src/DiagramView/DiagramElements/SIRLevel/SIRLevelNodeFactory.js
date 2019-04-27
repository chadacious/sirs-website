import * as SRD from 'storm-react-diagrams';
import { SIRLevelNodeWidget } from './SIRLevelNodeWidget';
import { SIRLevelNodeModel } from './SIRLevelNodeModel';
import * as React from 'react';

export class SIRLevelNodeFactory extends SRD.AbstractNodeFactory {
	constructor() {
		super('SIRLevel');
	}

	generateReactWidget(diagramEngine, node) {
		return <SIRLevelNodeWidget node={node} />;
	}

	getNewInstance() {
		return new SIRLevelNodeModel();
	}
}
