import * as _ from "lodash";
import { PortModel } from 'storm-react-diagrams';
import { DefaultLinkModel } from "storm-react-diagrams";

export class PortWithExtrasModel extends PortModel {
    constructor(isInput, name, label = null, id) {
		super(id, "PortWithExtras", id);
		this.in = isInput;
        this.label = label || name;
        this.extras = { code: name };
	}

	deSerialize(object, engine) {
		super.deSerialize(object, engine);
		this.in = object.in;
        this.label = object.label;
        this.extras = object.extras;
	}

	serialize() {
		return _.merge(super.serialize(), {
            in: this.in,
			label: this.label,
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
		let link = super.createLinkModel();
		return link || new DefaultLinkModel();
	}
}
