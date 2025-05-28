import React, { useState } from 'react';

const HoverHighlight = ({ node }) => {

    return (
        <div>
            {node && (
                <div className="text-xs">
                    <div>{node.title}</div>
                </div>
            )}
        </div>
    );
};

export default HoverHighlight;