// Home page functionality
import { getAllStates, submitFeedback, showLoading, showError, showSuccess, escapeHtml } from './data.js';
import { Slider } from './slider.js';
import { initMap } from './map.js';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Discover NorthEast home page...');
    
    // Initialize components
    initHeroSlider();
    initMobileMenu();
    await loadStatesData();
    initFeedbackForm();
});

// Initialize hero slider
function initHeroSlider() {
    const heroSlider = new Slider('heroSlideshow');
    
    // Sample hero images - replace with actual images
    const heroImages = [
        {
            src: '/assets/hero-1.jpg',
            alt: 'Beautiful landscape of NorthEast India',
            caption: {
                title: 'Welcome to NorthEast India',
                text: 'Explore the unexplored paradise of India'
            }
        },
        {
            src: '/assets/hero-2.jpg',
            alt: 'Living Root Bridges of Meghalaya',
            caption: {
                title: 'Living Root Bridges',
                text: 'Marvel at nature\'s engineering in Meghalaya'
            }
        },
        {
            src: '/assets/hero-3.jpg',
            alt: 'Tawang Monastery in Arunachal Pradesh',
            caption: {
                title: 'Buddhist Heritage',
                text: 'Discover ancient monasteries and spiritual peace'
            }
        },
        {
            src: '/assets/hero-4.jpg',
            alt: 'Tea Gardens of Assam',
            caption: {
                title: 'Tea Gardens',
                text: 'Experience the lush tea estates of Assam'
            }
        },
        {
            src: '/assets/hero-5.jpg',
            alt: 'Hornbill Festival Nagaland',
            caption: {
                title: 'Vibrant Festivals',
                text: 'Celebrate the rich cultural heritage'
            }
        }
    ];
    
    heroSlider.loadSlides(heroImages);
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

// Load states data and initialize map
async function loadStatesData() {
    const mapContainer = document.getElementById('homeMap');
    const highlightsGrid = document.getElementById('highlightsGrid');
    const statesListFallback = document.querySelector('.states-grid');
    
    try {
        showLoading(mapContainer);
        
        const states = await getAllStates();
        
        if (!states || states.length === 0) {
            throw new Error('No states data available');
        }
        
        // Initialize interactive map
        initMap('homeMap', 'overview', { states });
        
        // Populate highlights grid
        if (highlightsGrid) {
            populateHighlights(highlightsGrid, states);
        }
        
        // Populate states list fallback for mobile
        if (statesListFallback) {
            populateStatesList(statesListFallback, states);
        }
        
    } catch (error) {
        console.error('Failed to load states:', error);
        showError(mapContainer, 'Failed to load map data. Please try again later.');
        
        // Show static list as fallback
        if (statesListFallback) {
            showStaticStatesList(statesListFallback);
        }
    }
}

// Populate highlights grid
function populateHighlights(container, states) {
    container.innerHTML = '';
    
    // Select featured destinations (first 6 states)
    const featured = states.slice(0, 6);
    
    featured.forEach(state => {
        const card = document.createElement('div');
        card.className = 'highlight-card';
        card.onclick = () => window.location.href = `state.html?slug=${state.slug}`;
        
        card.innerHTML = `
            <img src="${state.featuredImages?.[0] || '/assets/placeholder.jpg'}" 
                 alt="${escapeHtml(state.name)}" 
                 onerror="this.src='/assets/placeholder.jpg'">
            <div class="highlight-card-content">
                <h3>${escapeHtml(state.name)}</h3>
                <p>${escapeHtml(state.description?.substring(0, 100) + '...')}</p>
                <span class="highlight-link">Explore →</span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Populate states list for mobile fallback
function populateStatesList(container, states) {
    container.innerHTML = '';
    
    states.forEach(state => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="state.html?slug=${state.slug}" class="state-link">
                <span class="state-icon">🏛️</span>
                <span>${escapeHtml(state.name)}</span>
            </a>
        `;
        container.appendChild(li);
    });
}

// Show static states list as ultimate fallback
function showStaticStatesList(container) {
    const staticStates = [
        { name: 'Assam', slug: 'assam' },
        { name: 'Arunachal Pradesh', slug: 'arunachal-pradesh' },
        { name: 'Meghalaya', slug: 'meghalaya' },
        { name: 'Manipur', slug: 'manipur' },
        { name: 'Mizoram', slug: 'mizoram' },
        { name: 'Nagaland', slug: 'nagaland' },
        { name: 'Sikkim', slug: 'sikkim' },
        { name: 'Tripura', slug: 'tripura' }
    ];
    
    populateStatesList(container, staticStates);
}

// Initialize feedback form
function initFeedbackForm() {
    const form = document.getElementById('feedbackForm');
    const messageDiv = document.getElementById('feedbackMessage');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const feedbackData = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };
        
        // Basic validation
        if (!feedbackData.name || !feedbackData.email || !feedbackData.message) {
            showMessage(messageDiv, 'Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(feedbackData.email)) {
            showMessage(messageDiv, 'Please enter a valid email address', 'error');
            return;
        }
        
        try {
            // Disable form while submitting
            form.querySelectorAll('input, textarea, button').forEach(el => {
                el.disabled = true;
            });
            
            const result = await submitFeedback(feedbackData);
            
            if (result.success) {
                showMessage(messageDiv, 'Thank you for your feedback!', 'success');
                form.reset();
            } else {
                throw new Error(result.error || 'Failed to submit feedback');
            }
            
        } catch (error) {
            console.error('Feedback submission error:', error);
            showMessage(messageDiv, 'Failed to submit feedback. Please try again.', 'error');
        } finally {
            // Re-enable form
            form.querySelectorAll('input, textarea, button').forEach(el => {
                el.disabled = false;
            });
        }
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show message helper
function showMessage(container, message, type) {
    if (!container) return;
    
    container.className = `feedback-message show ${type}`;
    container.textContent = message;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        container.classList.remove('show');
    }, 5000);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});