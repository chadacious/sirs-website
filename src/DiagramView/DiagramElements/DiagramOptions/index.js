import React from 'react'
import { Button, Accordion } from 'semantic-ui-react';
import { SwatchesPicker } from 'react-color';

const DiagramOptions = ({ node, onUpdate }) => {
    const handleColorChange = (color) => {
        // node.color = color.hex;
        onUpdate({ color: color.hex });
    }

    const diagramPanels = [
        {
            key: 'color',
            title: {
                content:
                    <Button
                        style={{ backgroundColor: node.color }}
                        icon='edit'
                        content='Update the node diagram color'
                    />
            },
            content: {
                content: <SwatchesPicker onChangeComplete={handleColorChange}/>
            }
        }
    ];

    return <Accordion panels={diagramPanels} />;
};

export default DiagramOptions;
