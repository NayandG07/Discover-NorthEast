// Admin panel functionality
import { 
    adminLogin, 
    getAllStates, 
    getAllCities,
    updateState,
    updateCity,
    moderateImage,
    getFeedback,
    escapeHtml,
    formatDate
} from './data.js';

let adminPassword = null;
let currentStates = [];
let currentCities = [];
let currentEditingState = null;
let currentEditingCity = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing admin panel...');
    
    initLoginForm();
    initTabs();
    initMobileMenu();
    
    // Check if already logged in (for development)
    const savedPassword = sessionStorage.getItem('adminPassword');
    if (savedPassword) {
        adminPassword = savedPassword;
        showDashboard();
    }
});

// Initialize login form
function initLoginForm() {
    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('loginError');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = form.adminPassword.value;
        
        if (!password) {
            showError(errorDiv, 'Please enter the admin password');
            return;
        }
        
        try {
            const result = await adminLogin(password);
            
            if (result.success) {
                adminPassword = password;
                sessionStorage.setItem('adminPassword', password);
                showDashboard();
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(errorDiv, error.message || 'Invalid password');
        }
    });
}

// Show dashboard after successful login
async function showDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    
    // Initialize logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Load initial data
    await loadStatesData();
    await loadCitiesData();
    
    // Initialize forms
    initStateForm();
    initCityForm();
    
    // Load moderation and feedback data
    loadModerationData();
    loadFeedbackData();
}

// Logout function
function logout() {
    adminPassword = null;
    sessionStorage.removeItem('adminPassword');
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('loginForm').reset();
}

// Initialize tabs
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active states
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${targetTab}Tab`).classList.add('active');
        });
    });
}

// Load states data
async function loadStatesData() {
    try {
        currentStates = await getAllStates();
        
        const stateSelect = document.getElementById('stateSelect');
        if (stateSelect) {
            stateSelect.innerHTML = '<option value="">-- Select a State --</option>';
            currentStates.forEach(state => {
                const option = document.createElement('option');
                option.value = state.slug;
                option.textContent = state.name;
                stateSelect.appendChild(option);
            });
            
            stateSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    loadStateForEditing(e.target.value);
                } else {
                    hideStateEditForm();
                }
            });
        }
    } catch (error) {
        console.error('Failed to load states:', error);
    }
}

// Load cities data
async function loadCitiesData() {
    try {
        currentCities = await getAllCities();
        
        const citySelect = document.getElementById('citySelect');
        if (citySelect) {
            citySelect.innerHTML = '<option value="">-- Select a City --</option>';
            currentCities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.slug;
                option.textContent = `${city.name} (${city.stateSlug})`;
                citySelect.appendChild(option);
            });
            
            citySelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    loadCityForEditing(e.target.value);
                } else {
                    hideCityEditForm();
                }
            });
        }
    } catch (error) {
        console.error('Failed to load cities:', error);
    }
}

// Load state for editing
function loadStateForEditing(slug) {
    const state = currentStates.find(s => s.slug === slug);
    if (!state) return;
    
    currentEditingState = state;
    
    // Populate form
    document.getElementById('stateName').value = state.name || '';
    document.getElementById('stateSlug').value = state.slug || '';
    document.getElementById('stateDescription').value = state.description || '';
    document.getElementById('stateHistory').value = state.history || '';
    document.getElementById('stateHighlights').value = (state.highlights || []).join(', ');
    
    // Show form
    document.getElementById('stateEditForm').style.display = 'block';
}

// Hide state edit form
function hideStateEditForm() {
    document.getElementById('stateEditForm').style.display = 'none';
    currentEditingState = null;
}

// Initialize state form
function initStateForm() {
    const form = document.getElementById('stateForm');
    const messageDiv = document.getElementById('stateMessage');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentEditingState || !adminPassword) return;
        
        const formData = new FormData(form);
        const stateData = {
            slug: currentEditingState.slug,
            name: formData.get('name'),
            description: formData.get('description'),
            history: formData.get('history'),
            highlights: formData.get('highlights').split(',').map(h => h.trim()).filter(h => h)
        };
        
        try {
            form.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
            
            const result = await updateState(adminPassword, stateData);
            
            if (result.success) {
                showMessage(messageDiv, 'State updated successfully!', 'success');
                
                // Update local data
                const index = currentStates.findIndex(s => s.slug === stateData.slug);
                if (index !== -1) {
                    currentStates[index] = { ...currentStates[index], ...stateData };
                }
            }
        } catch (error) {
            console.error('Update error:', error);
            showMessage(messageDiv, error.message || 'Failed to update state', 'error');
        } finally {
            form.querySelectorAll('input, textarea, button').forEach(el => el.disabled = false);
        }
    });
}

// Load city for editing
function loadCityForEditing(slug) {
    const city = currentCities.find(c => c.slug === slug);
    if (!city) return;
    
    currentEditingCity = city;
    
    // Populate form
    document.getElementById('cityName').value = city.name || '';
    document.getElementById('citySlug').value = city.slug || '';
    document.getElementById('citySummary').value = city.summary || '';
    document.getElementById('cityHistory').value = city.history || '';
    document.getElementById('citySpecialties').value = (city.localSpecialties || []).join(', ');
    
    // Show form
    document.getElementById('cityEditForm').style.display = 'block';
}

// Hide city edit form
function hideCityEditForm() {
    document.getElementById('cityEditForm').style.display = 'none';
    currentEditingCity = null;
}

// Initialize city form
function initCityForm() {
    const form = document.getElementById('cityForm');
    const messageDiv = document.getElementById('cityMessage');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentEditingCity || !adminPassword) return;
        
        const formData = new FormData(form);
        const cityData = {
            slug: currentEditingCity.slug,
            name: formData.get('name'),
            summary: formData.get('summary'),
            history: formData.get('history'),
            localSpecialties: formData.get('localSpecialties').split(',').map(s => s.trim()).filter(s => s)
        };
        
        try {
            form.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
            
            const result = await updateCity(adminPassword, cityData);
            
            if (result.success) {
                showMessage(messageDiv, 'City updated successfully!', 'success');
                
                // Update local data
                const index = currentCities.findIndex(c => c.slug === cityData.slug);
                if (index !== -1) {
                    currentCities[index] = { ...currentCities[index], ...cityData };
                }
            }
        } catch (error) {
            console.error('Update error:', error);
            showMessage(messageDiv, error.message || 'Failed to update city', 'error');
        } finally {
            form.querySelectorAll('input, textarea, button').forEach(el => el.disabled = false);
        }
    });
}

// Load moderation data
async function loadModerationData() {
    const moderationGrid = document.getElementById('moderationGrid');
    if (!moderationGrid) return;
    
    try {
        // Get all cities and filter for unmoderated images
        const cities = await getAllCities();
        const unmodeatedImages = [];
        
        cities.forEach(city => {
            if (city.gallery) {
                city.gallery.forEach(image => {
                    if (image.moderated === false) {
                        unmodeatedImages.push({
                            ...image,
                            citySlug: city.slug,
                            cityName: city.name
                        });
                    }
                });
            }
        });
        
        if (unmodeatedImages.length === 0) {
            moderationGrid.innerHTML = '<p>No images pending moderation</p>';
            return;
        }
        
        moderationGrid.innerHTML = unmodeatedImages.map(image => `
            <div class="moderation-item" data-city="${image.citySlug}" data-image="${image.id}">
                <img src="${image.url}" alt="${escapeHtml(image.caption || 'User upload')}" 
                     onerror="this.src='/assets/placeholder.jpg'">
                <div class="moderation-info">
                    <p><strong>City:</strong> ${escapeHtml(image.cityName)}</p>
                    <p><strong>Caption:</strong> ${escapeHtml(image.caption || 'No caption')}</p>
                    <p><strong>Uploaded:</strong> ${formatDate(image.uploadedAt)}</p>
                </div>
                <div class="moderation-actions">
                    <button class="btn btn-success btn-small" onclick="approveImage('${image.citySlug}', '${image.id}')">
                        Approve
                    </button>
                    <button class="btn btn-danger btn-small" onclick="rejectImage('${image.citySlug}', '${image.id}')">
                        Reject
                    </button>
                </div>
                <span class="moderation-badge">Pending</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load moderation data:', error);
        moderationGrid.innerHTML = '<p>Failed to load moderation data</p>';
    }
}

// Approve image
window.approveImage = async function(citySlug, imageId) {
    if (!adminPassword) return;
    
    try {
        const result = await moderateImage(adminPassword, citySlug, imageId, 'approve');
        
        if (result.success) {
            // Remove from moderation grid
            const item = document.querySelector(`[data-city="${citySlug}"][data-image="${imageId}"]`);
            if (item) {
                item.remove();
            }
            
            // Check if grid is empty
            const moderationGrid = document.getElementById('moderationGrid');
            if (moderationGrid && moderationGrid.children.length === 0) {
                moderationGrid.innerHTML = '<p>No images pending moderation</p>';
            }
        }
    } catch (error) {
        console.error('Failed to approve image:', error);
        alert('Failed to approve image: ' + error.message);
    }
};

// Reject image
window.rejectImage = async function(citySlug, imageId) {
    if (!adminPassword) return;
    
    if (!confirm('Are you sure you want to reject and delete this image?')) {
        return;
    }
    
    try {
        const result = await moderateImage(adminPassword, citySlug, imageId, 'reject');
        
        if (result.success) {
            // Remove from moderation grid
            const item = document.querySelector(`[data-city="${citySlug}"][data-image="${imageId}"]`);
            if (item) {
                item.remove();
            }
            
            // Check if grid is empty
            const moderationGrid = document.getElementById('moderationGrid');
            if (moderationGrid && moderationGrid.children.length === 0) {
                moderationGrid.innerHTML = '<p>No images pending moderation</p>';
            }
        }
    } catch (error) {
        console.error('Failed to reject image:', error);
        alert('Failed to reject image: ' + error.message);
    }
};

// Load feedback data
async function loadFeedbackData() {
    const feedbackList = document.getElementById('feedbackList');
    if (!feedbackList || !adminPassword) return;
    
    try {
        const feedback = await getFeedback(adminPassword);
        
        if (!feedback || feedback.length === 0) {
            feedbackList.innerHTML = '<p>No feedback received yet</p>';
            return;
        }
        
        // Sort by date (newest first)
        feedback.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        feedbackList.innerHTML = feedback.map(item => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <span class="feedback-author">${escapeHtml(item.name)}</span>
                    <span class="feedback-date">${formatDate(item.timestamp)}</span>
                </div>
                <div class="feedback-email">${escapeHtml(item.email)}</div>
                <div class="feedback-message">${escapeHtml(item.message)}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load feedback:', error);
        feedbackList.innerHTML = '<p>Failed to load feedback data</p>';
    }
}

// Cancel edit (global function for onclick)
window.cancelEdit = function() {
    hideStateEditForm();
    hideCityEditForm();
    document.getElementById('stateSelect').value = '';
    document.getElementById('citySelect').value = '';
};

// Show error message
function showError(container, message) {
    if (!container) return;
    
    container.className = 'error-message show';
    container.textContent = message;
    
    setTimeout(() => {
        container.classList.remove('show');
    }, 5000);
}

// Show message
function showMessage(container, message, type) {
    if (!container) return;
    
    container.className = `message show ${type}`;
    container.textContent = message;
    
    setTimeout(() => {
        container.classList.remove('show');
    }, 5000);
}

// Initialize mobile menu
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}