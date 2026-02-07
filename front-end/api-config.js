// API Configuration





const API_BASE_URL = 'http://localhost/UniConnect/backend/api';

const API_ENDPOINTS = {
    AUTH: {
        REGISTER: `${API_BASE_URL}/auth.php?action=register`,
        LOGIN: `${API_BASE_URL}/auth.php?action=login`,
        GET_USER: `${API_BASE_URL}/auth.php`
    },
    MODULES: {
        CREATE: `${API_BASE_URL}/modules.php`,
        GET_ALL: `${API_BASE_URL}/modules.php`,
        GET_ONE: (id) => `${API_BASE_URL}/modules.php?id=${id}`,
        DELETE: (id) => `${API_BASE_URL}/modules.php?id=${id}`,
        RATE: `${API_BASE_URL}/modules.php?action=rate`
    },
    MARKETPLACE: {
        CREATE: `${API_BASE_URL}/marketplace.php`,
        GET_ALL: `${API_BASE_URL}/marketplace.php`,
        SEARCH: (term) => `${API_BASE_URL}/marketplace.php?search=${term}`,
        DELETE: (id) => `${API_BASE_URL}/marketplace.php?id=${id}`,
        UPDATE_STATUS: `${API_BASE_URL}/marketplace.php`
    },
    STUDY_GROUPS: {
        CREATE: `${API_BASE_URL}/studygroups.php`,
        GET_ALL: `${API_BASE_URL}/studygroups.php`,
        SEARCH: (term) => `${API_BASE_URL}/studygroups.php?search=${term}`,
        DELETE: (id) => `${API_BASE_URL}/studygroups.php?id=${id}`
    },
    LOST_FOUND: {
        CREATE: `${API_BASE_URL}/lostandfound.php`,
        GET_ALL: `${API_BASE_URL}/lostandfound.php`,
        GET_BY_STATUS: (status) => `${API_BASE_URL}/lostandfound.php?status=${status}`,
        SEARCH: (term) => `${API_BASE_URL}/lostandfound.php?search=${term}`,
        DELETE: (id) => `${API_BASE_URL}/lostandfound.php?id=${id}`
    },
    TODOS: {
        CREATE: `${API_BASE_URL}/todos.php`,
        GET_ALL: `${API_BASE_URL}/todos.php`,
        UPDATE: `${API_BASE_URL}/todos.php`,
        DELETE: (id) => `${API_BASE_URL}/todos.php?id=${id}`
    }
};

// Helper function to make API calls
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API call failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_ENDPOINTS, apiCall };
}