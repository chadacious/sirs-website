import React from 'react'
import { Button, Accordion } from 'semantic-ui-react';
import { SwatchesPicker } from 'react-color';

const DiagramOptions = ({ node, disabled, onUpdate }) => {
    const handleColorChange = (color) => {
        // node.color = color.hex;
        onUpdate({ color: color.hex });
    }
    const SwatchColorButton = (
        <Button
            style={{ backgroundColor: node.color }}
            icon='edit'
            disabled={disabled}
            content='Update the node diagram color'
        />
    );
    const diagramPanels = [
        {
            key: 'color',
            title: {
                content: SwatchColorButton,
            },
            content: {
                content: !disabled ? <SwatchesPicker onChangeComplete={handleColorChange}/> : null,
            }
        }
    ];

    return disabled ? SwatchColorButton : <Accordion panels={diagramPanels} disabled={disabled} />;
};

export default DiagramOptions;
