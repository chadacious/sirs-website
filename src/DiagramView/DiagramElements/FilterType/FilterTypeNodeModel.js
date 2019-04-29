import * as _ from "lodash";
import { NodeModel, Toolkit } from 'storm-react-diagrams';
import { PortWithExtrasModel } from '../PortWithExtras/PortWithExtrasModel';
import { modelChangeEvent } from '../../utils/diagram-utils';

export class FilterTypeNodeModel extends NodeModel {
	constructor(name = "Untitled", color = "rgb(0,192,255)") {
		super("FilterType");
		this.name = name;
		this.color = color;
		this.addListener({ selectionChanged: modelChangeEvent });
	}

	addOutPort(label) {
		return this.addPort(new PortWithExtrasModel(false, label, label, Toolkit.UID()));
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

	getOutPorts() {
		return _.filter(this.ports, portModel => {
			return !portModel.in;
		});
	}
}
