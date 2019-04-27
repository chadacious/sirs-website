import * as _ from "lodash";
import { PortModel } from 'storm-react-diagrams';

export class PortWithExtrasModel extends PortModel {
    constructor(isInput, name, label = null, id) {
		super(name, "PortWithExtras", id);
		this.in = isInput;
        this.label = label || name;
        this.extras = { code: name };
	}

	deSerialize(object, engine) {
		super.deSerialize(object, engine);
		this.extras = object.extras;
	}

	serialize() {
		return _.merge(super.serialize(), {
			extras: this.extras,
		});
	}

}
