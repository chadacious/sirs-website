import * as SRD from 'storm-react-diagrams';
import { MultipleChoiceNodeWidget } from './MultipleChoiceNodeWidget';
import { MultipleChoiceNodeModel } from './MultipleChoiceNodeModel';
import * as React from 'react';

export class MultipleChoiceNodeFactory extends SRD.AbstractNodeFactory {
	constructor() {
		super('MultipleChoice');
	}

	generateReactWidget(diagramEngine, node) {
		return <MultipleChoiceNodeWidget node={node} />;
	}

	getNewInstance() {
		return new MultipleChoiceNodeModel();
	}
}
