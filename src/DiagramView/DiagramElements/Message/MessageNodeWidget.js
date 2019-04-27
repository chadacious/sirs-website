import * as React from "react";
import * as _ from "lodash";
import MessageOptions from './MessageOptions';
import { DefaultPortLabel, BaseWidget } from 'storm-react-diagrams';

export class MessageNodeWidget extends BaseWidget {
	constructor(props) {
		super("Message", props);
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
			<div {...this.getProps()} className={classPrefix} style={{ background: node.color, borderRadius: '15px' }}>
				<div className={`${classPrefix}__title`} style={{ borderTopRightRadius: '15px', borderTopLeftRadius: '15px' }}>
					<div className={`${classPrefix}__name`}>{node.name}</div>
				</div>
				<div className={`${classPrefix}__in`}>
					{_.map(node.getInPorts()
						.sort((a, b) => a.extras.sortOrder > b.extras.sortOrder ? 1 : -1),
						this.generatePort.bind(this)
					)}
				</div>
				<MessageOptions node={node} />
			</div>
		);
	}
}
