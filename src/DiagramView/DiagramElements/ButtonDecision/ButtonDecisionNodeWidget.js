import * as React from "react";
import * as _ from "lodash";
import ButtonDecisionOptions from './ButtonDecisionOptions';
import { DefaultPortLabel, BaseWidget } from 'storm-react-diagrams';

export class ButtonDecisionNodeWidget extends BaseWidget {
	constructor(props) {
		super("ButtonDecision", props);
		this.state = {};
	}

	generatePort(port) {
		return <DefaultPortLabel model={port} key={port.id} />;
	}

	render() {
		// console.log('Here we are:', this.getProps(), this.bem("__title"));
		const { node } = this.props;
		const classPrefix = 'srd-default-node';
		return (
			<div {...this.getProps()} className={classPrefix} style={{ background: node.color }}>
				<div className={`${classPrefix}__title`}>
					<div className={`${classPrefix}__name`}>{node.name}</div>
				</div>
				<div className={`${classPrefix}__ports`}>
					<div className={`${classPrefix}__in`}>
						{_.map(node.getInPorts(), this.generatePort.bind(this))}
					</div>
					<div className={`${classPrefix}__out`}>
						{_.map(node.getOutPorts(), this.generatePort.bind(this))}
					</div>
				</div>
				<ButtonDecisionOptions node={node} />	
			</div>
		);
	}
}
