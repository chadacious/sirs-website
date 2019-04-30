import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    const { REACT_APP_IMAGE_PATH } = process.env;

    return (
        <div>
            <img
                src={`${REACT_APP_IMAGE_PATH}/NotFound.png`}
                alt="Page not found"
                style={{ width: 400, height: 400, display: 'block', margin: 'auto', position: 'relative' }}
            />
            <center><Link to="/sirs">Return to Home Page</Link></center>
        </div>
    );
};

export default NotFound;
