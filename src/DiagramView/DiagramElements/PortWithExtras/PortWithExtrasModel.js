import * as _ from "lodash";
import { PortModel } from 'storm-react-diagrams';
import { DefaultLinkModel } from "storm-react-diagrams";
import { updateOutPortItemLabel } from '../../utils/diagram-utils';
import { modelChangeEvent } from '../../utils/diagram-utils';

export class PortWithExtrasModel extends PortModel {
    constructor(isInput, name, label = null, id) {
		super(id, "PortWithExtras", id);
		this.in = isInput;
		this.label = label || name;
        this.extras = {};
	}

	deSerialize(object, engine) {
		super.deSerialize(object, engine);
		this.in = object.in;
        this.label = object.label ? object.label : updateOutPortItemLabel(object);
        this.extras = object.extras;
	}

	serialize() {
		return _.merge(super.serialize(), {
			in: this.in,
			label: typeof this.label === 'string' ? this.label : null,
            extras: this.extras,
		});
	}

	link(port) {
		let link = this.createLinkModel();
		link.setSourcePort(this);
		link.setTargetPort(port);
		return link;
	}

	canLinkToPort(port) {
		if (port instanceof PortWithExtrasModel) {
			return this.in !== port.in;
		}
		return true;
	}

	createLinkModel() {
		if (!this.isInput) {
			// Somehow this often doesn't seem to know that there are other links
			// on this port so this doesn't work consistently
			super.setMaximumLinks(1);
		}
		// console.log('checking links', this.maximumLinks);
		// console.log(_.keys(this.parent.parent.links).filter(linkKey => this.parent.parent.links[linkKey].sourcePort.id === this.id));
		let link = super.createLinkModel() || new DefaultLinkModel();
		link.addLabel(this.label && typeof this.label === 'string' ? this.label : null);
		link.addListener({
			sourcePortChanged: modelChangeEvent,
			targetPortChanged: modelChangeEvent,
			selectionChanged: modelChangeEvent,
			entityRemoved: modelChangeEvent,
		});
		return link;
	}
}
