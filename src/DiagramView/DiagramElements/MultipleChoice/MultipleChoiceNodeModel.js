import * as _ from "lodash";
import { NodeModel, Toolkit } from 'storm-react-diagrams';
import { PortWithExtrasModel } from '../PortWithExtras/PortWithExtrasModel';

export class MultipleChoiceNodeModel extends NodeModel {
	constructor(name = "Untitled", color = "rgb(0,192,255)") {
		super("MultipleChoice");
		this.name = name;
		this.color = color;
	}

	addInPort(label) {
		return this.addPort(new PortWithExtrasModel(true, label, label, Toolkit.UID()));
	}

	addOutPort(label) {
		const port = this.addPort(new PortWithExtrasModel(false, label, label, Toolkit.UID()));
		port.extras.code = label.toUpperCase();
		port.extras.sortOrder = this.getOutPorts().length;
		return this.addPort(port);
	}

	deSerialize(object, engine) {
		super.deSerialize(object, engine);
		this.name = object.name;
		this.color = object.color;
	}

	serialize() {
		return _.merge(super.serialize(), {
			name: this.name,
			color: this.color
		});
	}

	getInPorts() {
		return _.filter(this.ports, portModel => {
			return portModel.in;
		});
	}

	getOutPorts() {
		return _.filter(this.ports, portModel => {
			return !portModel.in;
		});
	}
}
