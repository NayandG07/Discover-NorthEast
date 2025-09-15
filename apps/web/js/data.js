// Data module for API interactions
const API_BASE = '/api';

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch with caching
 */
async function fetchWithCache(url, options = {}) {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Cache successful responses
        cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
        
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

/**
 * Get all states
 */
export async function getAllStates() {
    return fetchWithCache(`${API_BASE}/states`);
}

/**
 * Get state by slug with cities
 */
export async function getState(slug) {
    return fetchWithCache(`${API_BASE}/states/${slug}`);
}

/**
 * Get all cities
 */
export async function getAllCities() {
    return fetchWithCache(`${API_BASE}/cities`);
}

/**
 * Get city by slug
 */
export async function getCity(slug) {
    return fetchWithCache(`${API_BASE}/cities/${slug}`);
}

/**
 * Submit feedback
 */
export async function submitFeedback(feedbackData) {
    const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit feedback');
    }
    
    return response.json();
}

/**
 * Upload image to city gallery
 */
export async function uploadImage(citySlug, file, caption) {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('citySlug', citySlug);
    formData.append('caption', caption);
    
    const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
    }
    
    return response.json();
}

/**
 * Admin login
 */
export async function adminLogin(password) {
    const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid password');
    }
    
    return response.json();
}

/**
 * Update state (admin)
 */
export async function updateState(password, stateData) {
    const response = await fetch(`${API_BASE}/admin/update/state`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, stateData })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update state');
    }
    
    // Clear cache for this state
    cache.clear();
    
    return response.json();
}

/**
 * Update city (admin)
 */
export async function updateCity(password, cityData) {
    const response = await fetch(`${API_BASE}/admin/update/city`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, cityData })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update city');
    }
    
    // Clear cache
    cache.clear();
    
    return response.json();
}

/**
 * Moderate image (admin)
 */
export async function moderateImage(password, citySlug, imageId, action) {
    const response = await fetch(`${API_BASE}/admin/moderate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, citySlug, imageId, action })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to moderate image');
    }
    
    // Clear cache
    cache.clear();
    
    return response.json();
}

/**
 * Get feedback (admin)
 */
export async function getFeedback(password) {
    const response = await fetch(`${API_BASE}/admin/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get feedback');
    }
    
    return response.json();
}

/**
 * Get URL parameters
 */
export function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Format date
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Show loading state
 */
export function showLoading(element) {
    element.innerHTML = '<div class="loading"></div>';
}

/**
 * Show error message
 */
export function showError(element, message) {
    element.innerHTML = `
        <div class="error-message show">
            <p>❌ ${message}</p>
            <button onclick="location.reload()">Retry</button>
        </div>
    `;
}

/**
 * Show success message
 */
export function showSuccess(element, message, duration = 3000) {
    const messageEl = document.createElement('div');
    messageEl.className = 'success-message show';
    messageEl.innerHTML = `✓ ${message}`;
    element.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, duration);
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Create element with HTML
 */
export function createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}