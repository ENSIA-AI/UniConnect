// API Configuration
const API_BASE_URL = 'http://localhost/UniConnect/backend/api';

const API_ENDPOINTS = {
    TODOS: {
        CREATE: `${API_BASE_URL}/todos.php`,
        GET_ALL: `${API_BASE_URL}/todos.php`,
        UPDATE: `${API_BASE_URL}/todos.php`,
        DELETE: (id) => `${API_BASE_URL}/todos.php?id=${id}`
    }
};

async function apiCall(url, options = {}) {
    try {
        console.log('API Call:', url, options.method || 'GET');
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
        
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}