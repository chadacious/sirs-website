import * as SRD from 'storm-react-diagrams';
import { ButtonDecisionNodeWidget } from './ButtonDecisionNodeWidget';
import { ButtonDecisionNodeModel } from './ButtonDecisionNodeModel';
import * as React from 'react';

export class ButtonDecisionNodeFactory extends SRD.AbstractNodeFactory {
	constructor() {
		super('ButtonDecision');
	}

	generateReactWidget(diagramEngine, node) {
		return <ButtonDecisionNodeWidget node={node} />;
	}

	getNewInstance() {
		return new ButtonDecisionNodeModel();
	}
}
