import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element }) => {
    const accessToken = localStorage.getItem('IMPaccessToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    // If no access token, redirect to login
    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    // If user is not logged in, redirect to login
    if (!userInfo || !userInfo.userType) {
        return <Navigate to="/login" replace />;
    }

    // Render the protected component
    return element;
};

export default PrivateRoute; 