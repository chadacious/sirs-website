import * as React from "react";
import * as _ from "lodash";
// import NodeProperties from '../NodeProperties';
import { DefaultPortLabel, BaseWidget } from 'storm-react-diagrams';

export class FilterTypeNodeWidget extends BaseWidget {
	constructor(props) {
		super("FilterType", props);
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
				<div className={`${classPrefix}__ports`} style={{ borderBottomRightRadius: '15px', borderBottomLeftRadius: '15px' }}>
					<div className={`${classPrefix}__out`}>
						{_.map(node.getOutPorts(), this.generatePort.bind(this))}
					</div>
				</div>
				{/* <NodeProperties node={node} /> */}
			</div>
		);
	}
}
