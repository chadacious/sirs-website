import { AbstractPortFactory } from "storm-react-diagrams";

export class PortWithExtrasFactory extends AbstractPortFactory {
	constructor(type, cb) {
		super("PortWithExtras");
		this.cb = cb;
	}

	getNewInstance(initialConfig) {
		return this.cb(initialConfig);
	}
}
