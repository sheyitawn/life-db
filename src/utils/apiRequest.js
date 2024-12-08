import axios from 'axios';

const apiRequest = async (endpoint, method = 'GET', data = null) => {
    try {
        const options = {
            method,
            url: `http://localhost:3001${endpoint}`, // Base URL
            headers: { 'Content-Type': 'application/json' },
        };

        if (data) options.data = data;

        const response = await axios(options);
        return response.data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

export default apiRequest;

// export const fetchData = async () => {
//     return await apiRequest('/data');
// };

// export const saveData = async (newData) => {
//     return await apiRequest('/data', 'POST', newData);
// };

