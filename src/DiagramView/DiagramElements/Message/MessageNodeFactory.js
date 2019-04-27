import * as SRD from 'storm-react-diagrams';
import { MessageNodeWidget } from './MessageNodeWidget';
import { MessageNodeModel } from './MessageNodeModel';
import * as React from 'react';

export class MessageNodeFactory extends SRD.AbstractNodeFactory {
	constructor() {
		super('Message');
	}

	generateReactWidget(diagramEngine, node) {
		return <MessageNodeWidget node={node} />;
	}

	getNewInstance() {
		return new MessageNodeModel();
	}
}
