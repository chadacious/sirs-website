import * as _ from "lodash";
import { NodeModel, Toolkit } from 'storm-react-diagrams';
import { DefaultPortModel } from 'storm-react-diagrams';

export class FilterTypeNodeModel extends NodeModel {
	constructor(name = "Untitled", color = "rgb(0,192,255)") {
		super("FilterType");
		this.name = name;
		this.color = color;
	}

	addInPort(label) {
		return this.addPort(new DefaultPortModel(true, Toolkit.UID(), label));
	}

	addOutPort(label) {
		return this.addPort(new DefaultPortModel(false, Toolkit.UID(), label));
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
