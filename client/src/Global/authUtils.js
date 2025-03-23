import axios from 'axios'
import { url } from './URL';

export const setAuthToken = (token) => {
    localStorage.setItem('IMPaccessToken', token);
    // Trigger storage event for other tabs/windows
    window.dispatchEvent(new Event('storage'));
};

export const logout = async () => {
    try {
        // Clear local storage
        localStorage.removeItem('IMPaccessToken');
        localStorage.removeItem('userInfo');
        
        // Make logout request to server
        await axios.post(`${url}/logout`);
        
        // Trigger storage event for other tabs/windows
        window.dispatchEvent(new Event('storage'));
        
        // Redirect to login page
        window.location.href = '/login';
    } catch (error) {
        console.error("Logout error:", error);
        // Even if the server request fails, still clear local storage and redirect
        localStorage.removeItem('IMPaccessToken');
        localStorage.removeItem('userInfo');
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/login';
    }
};

export const getAuthToken = () => {
    return localStorage.getItem('IMPaccessToken');
};

export const isAuthenticated = () => {
    const token = getAuthToken();
    return !!token;
};

export const getUserDetails = async () => {
    const token = getAuthToken();

    if (!token) {
        return false;
    }

    try {
        const response = await axios.post(`${url}/anyuser`, { accessToken: token });
        
        if (response.status === 200) {
            const userDetails = response.data;
            return userDetails.msg._doc;
        } else {
            localStorage.removeItem('IMPaccessToken');
            window.dispatchEvent(new Event('storage'));
            return false;
        }
    } catch (error) {
        console.error('Error fetching user details:', error.message);
        localStorage.removeItem('IMPaccessToken');
        window.dispatchEvent(new Event('storage'));
        return false;
    }
};


