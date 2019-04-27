import * as React from "react";
import * as _ from 'lodash';
import MultipleChoiceOptions from './MultipleChoiceOptions';
import { DefaultPortLabel, BaseWidget } from 'storm-react-diagrams';

export class MultipleChoiceNodeWidget extends BaseWidget {
	constructor(props) {
		super("MultipleChoice", props);
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
						{_.map(node.getInPorts()
							.sort((a, b) => a.extras.sortOrder > b.extras.sortOrder ? 1 : -1),
							this.generatePort.bind(this)
						)}
					</div>
					<div className={`${classPrefix}__out`}>
						{_.map(node.getOutPorts()
							.sort((a, b) => a.extras.sortOrder > b.extras.sortOrder ? 1 : -1),
							this.generatePort.bind(this)
						)}
					</div>
				</div>
				<MultipleChoiceOptions node={node} />
			</div>
		);
	}
}
