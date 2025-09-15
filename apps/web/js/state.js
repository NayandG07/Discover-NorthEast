// State page functionality
import { getState, getUrlParam, showLoading, showError, escapeHtml } from './data.js';
import { Slider } from './slider.js';
import { initMap } from './map.js';

let currentState = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing state page...');
    
    const stateSlug = getUrlParam('slug');
    
    if (!stateSlug) {
        showError(document.body, 'No state specified. Redirecting to home...');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    await loadStateData(stateSlug);
    initMobileMenu();
});

// Load state data
async function loadStateData(slug) {
    try {
        // Show loading state
        document.getElementById('stateName').textContent = 'Loading...';
        showLoading(document.getElementById('stateMap'));
        
        // Fetch state data with cities
        const stateData = await getState(slug);
        
        if (!stateData) {
            throw new Error('State not found');
        }
        
        currentState = stateData;
        
        // Update page title
        document.title = `${stateData.name} - Discover NorthEast India`;
        
        // Populate page content
        populateStateInfo(stateData);
        initStateSlider(stateData);
        initStateMap(stateData);
        populateCities(stateData);
        populateOtherStates(stateData);
        
    } catch (error) {
        console.error('Failed to load state:', error);
        showError(document.getElementById('stateMap'), 'Failed to load state data. Please try again.');
        
        // Show minimal info if available
        document.getElementById('stateName').textContent = 'Error Loading State';
    }
}

// Populate state information
function populateStateInfo(state) {
    // Update breadcrumb
    const breadcrumb = document.getElementById('stateBreadcrumb');
    if (breadcrumb) breadcrumb.textContent = state.name;
    
    // Update hero content
    document.getElementById('stateName').textContent = state.name;
    document.getElementById('stateNameAbout').textContent = state.name;
    
    const tagline = document.getElementById('stateTagline');
    if (tagline && state.capital) {
        tagline.textContent = `Capital: ${state.capital}`;
    }
    
    // Update description
    const descEl = document.getElementById('stateDescription');
    if (descEl) {
        descEl.innerHTML = `<p>${escapeHtml(state.description)}</p>`;
    }
    
    // Update history
    const historyEl = document.getElementById('stateHistory');
    if (historyEl && state.history) {
        historyEl.innerHTML = `<p>${escapeHtml(state.history)}</p>`;
    }
    
    // Update highlights
    const highlightsEl = document.getElementById('stateHighlights');
    if (highlightsEl && state.highlights) {
        highlightsEl.innerHTML = state.highlights.map(highlight => 
            `<li>${escapeHtml(highlight)}</li>`
        ).join('');
    }
    
    // Update festivals
    const festivalsEl = document.getElementById('stateFestivals');
    if (festivalsEl && state.festivals) {
        festivalsEl.innerHTML = state.festivals.map(festival => `
            <div class="festival-item">
                <h4>${escapeHtml(festival.name)}</h4>
                <p>${escapeHtml(festival.summary)}</p>
            </div>
        `).join('');
    }
    
    // Update quick facts
    if (state.capital) {
        const capitalEl = document.getElementById('stateCapital');
        if (capitalEl) capitalEl.textContent = `Capital: ${state.capital}`;
    }
    
    if (state.languages) {
        const langEl = document.getElementById('stateLanguages');
        if (langEl) langEl.textContent = `Languages: ${state.languages}`;
    }
    
    if (state.bestTime) {
        const timeEl = document.getElementById('stateBestTime');
        if (timeEl) timeEl.textContent = `Best Time: ${state.bestTime}`;
    }
}

// Initialize state image slider
function initStateSlider(state) {
    if (!state.featuredImages || state.featuredImages.length === 0) {
        // Use placeholder if no images
        state.featuredImages = ['/assets/placeholder.jpg'];
    }
    
    const slider = new Slider('stateSlideshow');
    
    const images = state.featuredImages.map((img, index) => ({
        src: img,
        alt: `${state.name} - Image ${index + 1}`
    }));
    
    slider.loadSlides(images);
}

// Initialize state map with cities
function initStateMap(state) {
    if (!state.citiesData || state.citiesData.length === 0) {
        const mapContainer = document.getElementById('stateMap');
        mapContainer.innerHTML = '<p class="no-data">No city data available</p>';
        return;
    }
    
    // Initialize map with state and cities
    initMap('stateMap', 'state', {
        state: state,
        cities: state.citiesData
    });
}

// Populate cities grid and list
function populateCities(state) {
    const citiesGrid = document.getElementById('citiesGrid');
    const citiesList = document.getElementById('citiesList');
    
    if (!state.citiesData || state.citiesData.length === 0) {
        if (citiesGrid) citiesGrid.innerHTML = '<p>No cities data available</p>';
        return;
    }
    
    // Populate cities grid
    if (citiesGrid) {
        citiesGrid.innerHTML = state.citiesData.map(city => `
            <div class="city-card" onclick="window.location.href='city.html?slug=${city.slug}'">
                <img src="${city.featuredImages?.[0] || '/assets/placeholder.jpg'}" 
                     alt="${escapeHtml(city.name)}"
                     onerror="this.src='/assets/placeholder.jpg'">
                <div class="city-card-content">
                    <h3>${escapeHtml(city.name)}</h3>
                    <p>${escapeHtml(city.summary?.substring(0, 100) + '...')}</p>
                    <span class="city-link">Explore →</span>
                </div>
            </div>
        `).join('');
    }
    
    // Populate cities list (fallback for mobile)
    if (citiesList) {
        citiesList.innerHTML = state.citiesData.map(city => `
            <li>
                <a href="city.html?slug=${city.slug}" class="city-list-link">
                    <span class="city-icon">🏙️</span>
                    <div>
                        <strong>${escapeHtml(city.name)}</strong>
                        <p>${escapeHtml(city.summary?.substring(0, 80) + '...')}</p>
                    </div>
                </a>
            </li>
        `).join('');
    }
}

// Populate other states links
function populateOtherStates(currentState) {
    const otherStatesEl = document.getElementById('otherStates');
    if (!otherStatesEl) return;
    
    // Static list of all states
    const allStates = [
        { name: 'Assam', slug: 'assam' },
        { name: 'Arunachal Pradesh', slug: 'arunachal-pradesh' },
        { name: 'Meghalaya', slug: 'meghalaya' },
        { name: 'Manipur', slug: 'manipur' },
        { name: 'Mizoram', slug: 'mizoram' },
        { name: 'Nagaland', slug: 'nagaland' },
        { name: 'Sikkim', slug: 'sikkim' },
        { name: 'Tripura', slug: 'tripura' }
    ];
    
    // Filter out current state
    const otherStates = allStates.filter(s => s.slug !== currentState.slug);
    
    otherStatesEl.innerHTML = otherStates.map(state => 
        `<a href="state.html?slug=${state.slug}">${escapeHtml(state.name)}</a>`
    ).join('');
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