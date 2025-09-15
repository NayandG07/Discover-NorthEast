// City page functionality
import { getCity, getState, uploadImage, getUrlParam, showLoading, showError, escapeHtml } from './data.js';
import { Slider } from './slider.js';
import { initMap } from './map.js';
import { createGallery } from './lightbox.js';

let currentCity = null;
let currentState = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing city page...');
    
    const citySlug = getUrlParam('slug');
    
    if (!citySlug) {
        showError(document.body, 'No city specified. Redirecting to home...');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    await loadCityData(citySlug);
    initMobileMenu();
    initUploadForm();
});

// Load city data
async function loadCityData(slug) {
    try {
        // Show loading state
        document.getElementById('cityName').textContent = 'Loading...';
        showLoading(document.getElementById('cityMap'));
        
        // Fetch city data
        const cityData = await getCity(slug);
        
        if (!cityData) {
            throw new Error('City not found');
        }
        
        currentCity = cityData;
        
        // Also fetch state data for breadcrumb
        if (cityData.stateSlug) {
            try {
                const stateData = await getState(cityData.stateSlug);
                currentState = stateData;
            } catch (error) {
                console.error('Failed to load state data:', error);
            }
        }
        
        // Update page title
        document.title = `${cityData.name} - Discover NorthEast India`;
        
        // Populate page content
        populateCityInfo(cityData);
        initCitySlider(cityData);
        initCityMap(cityData);
        populateExplore(cityData);
        populateGallery(cityData);
        populatePOIs(cityData);
        populateOtherCities();
        
    } catch (error) {
        console.error('Failed to load city:', error);
        showError(document.getElementById('cityMap'), 'Failed to load city data. Please try again.');
        
        // Show minimal info if available
        document.getElementById('cityName').textContent = 'Error Loading City';
    }
}

// Populate city information
function populateCityInfo(city) {
    // Update breadcrumbs
    const cityBreadcrumb = document.getElementById('cityBreadcrumb');
    if (cityBreadcrumb) cityBreadcrumb.textContent = city.name;
    
    if (currentState) {
        const stateBreadcrumbLink = document.getElementById('stateBreadcrumbLink');
        if (stateBreadcrumbLink) {
            stateBreadcrumbLink.href = `state.html?slug=${currentState.slug}`;
            stateBreadcrumbLink.textContent = currentState.name;
        }
        
        const backToState = document.getElementById('backToState');
        if (backToState) {
            backToState.href = `state.html?slug=${currentState.slug}`;
            backToState.textContent = `Back to ${currentState.name}`;
        }
    }
    
    // Update hero content
    document.getElementById('cityName').textContent = city.name;
    document.getElementById('cityNameAbout').textContent = city.name;
    
    const tagline = document.getElementById('cityTagline');
    if (tagline && currentState) {
        tagline.textContent = `${currentState.name}, India`;
    }
    
    // Update summary
    const summaryEl = document.getElementById('citySummary');
    if (summaryEl && city.summary) {
        summaryEl.innerHTML = `<p>${escapeHtml(city.summary)}</p>`;
    }
    
    // Update history
    const historyEl = document.getElementById('cityHistory');
    if (historyEl && city.history) {
        historyEl.innerHTML = `<p>${escapeHtml(city.history)}</p>`;
    }
    
    // Update local specialties
    const specialtiesEl = document.getElementById('citySpecialties');
    if (specialtiesEl && city.localSpecialties) {
        specialtiesEl.innerHTML = city.localSpecialties.map(specialty => 
            `<li>${escapeHtml(specialty)}</li>`
        ).join('');
    }
}

// Initialize city image slider
function initCitySlider(city) {
    if (!city.featuredImages || city.featuredImages.length === 0) {
        // Use placeholder if no images
        city.featuredImages = ['/assets/placeholder.jpg'];
    }
    
    const slider = new Slider('citySlideshow');
    
    const images = city.featuredImages.map((img, index) => ({
        src: img,
        alt: `${city.name} - Image ${index + 1}`
    }));
    
    slider.loadSlides(images);
}

// Initialize city map with POIs
function initCityMap(city) {
    // Initialize map with city and POIs
    initMap('cityMap', 'city', { city: city });
}

// Populate explore section
function populateExplore(city) {
    const exploreEl = document.getElementById('cityExplore');
    
    if (!exploreEl || !city.explore || city.explore.length === 0) {
        if (exploreEl) exploreEl.innerHTML = '<p>No exploration data available</p>';
        return;
    }
    
    exploreEl.innerHTML = city.explore.map(item => `
        <div class="explore-item">
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.desc)}</p>
        </div>
    `).join('');
}

// Populate gallery
function populateGallery(city) {
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (!galleryGrid) return;
    
    // Filter to show only moderated images or all if none are moderated
    let galleryImages = city.gallery || [];
    const moderatedImages = galleryImages.filter(img => img.moderated !== false);
    
    if (moderatedImages.length > 0) {
        galleryImages = moderatedImages;
    }
    
    if (galleryImages.length === 0) {
        // Show placeholder gallery
        galleryImages = [
            { url: '/assets/gallery-1.jpg', caption: 'Beautiful views of ' + city.name },
            { url: '/assets/gallery-2.jpg', caption: 'Local culture and traditions' },
            { url: '/assets/gallery-3.jpg', caption: 'Tourist attractions' }
        ];
    }
    
    // Create gallery with lightbox
    createGallery('galleryGrid', galleryImages);
}

// Populate POIs list
function populatePOIs(city) {
    const poisListItems = document.getElementById('poisListItems');
    
    if (!poisListItems || !city.pois || city.pois.length === 0) {
        if (poisListItems) poisListItems.innerHTML = '<li>No points of interest data available</li>';
        return;
    }
    
    poisListItems.innerHTML = city.pois.map(poi => `
        <li>
            <div class="poi-name">${escapeHtml(poi.title)}</div>
            ${poi.type ? `<span class="poi-type">${escapeHtml(poi.type)}</span>` : ''}
            ${poi.desc ? `<p>${escapeHtml(poi.desc)}</p>` : ''}
        </li>
    `).join('');
}

// Populate other cities
function populateOtherCities() {
    const otherCitiesEl = document.getElementById('otherCities');
    if (!otherCitiesEl) return;
    
    // Show cities from the same state if available
    if (currentState && currentState.citiesData) {
        const otherCities = currentState.citiesData.filter(c => c.slug !== currentCity.slug);
        
        if (otherCities.length > 0) {
            otherCitiesEl.innerHTML = otherCities.map(city => 
                `<a href="city.html?slug=${city.slug}">${escapeHtml(city.name)}</a>`
            ).join('');
            return;
        }
    }
    
    // Fallback: show some popular cities
    const popularCities = [
        { name: 'Guwahati', slug: 'guwahati' },
        { name: 'Shillong', slug: 'shillong' },
        { name: 'Gangtok', slug: 'gangtok' },
        { name: 'Kohima', slug: 'kohima' }
    ];
    
    otherCitiesEl.innerHTML = popularCities
        .filter(c => c.slug !== currentCity?.slug)
        .map(city => 
            `<a href="city.html?slug=${city.slug}">${escapeHtml(city.name)}</a>`
        ).join('');
}

// Initialize upload form
function initUploadForm() {
    const form = document.getElementById('uploadForm');
    const messageDiv = document.getElementById('uploadMessage');
    const photoInput = document.getElementById('photoInput');
    
    if (!form || !currentCity) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = photoInput.files[0];
        if (!file) {
            showMessage(messageDiv, 'Please select an image', 'error');
            return;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showMessage(messageDiv, 'Image size must be less than 5MB', 'error');
            return;
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showMessage(messageDiv, 'Please upload a valid image (JPEG, PNG, GIF, or WebP)', 'error');
            return;
        }
        
        const formData = new FormData(form);
        const caption = formData.get('caption') || '';
        
        try {
            // Disable form while uploading
            form.querySelectorAll('input, button').forEach(el => {
                el.disabled = true;
            });
            
            showMessage(messageDiv, 'Uploading...', 'info');
            
            const result = await uploadImage(currentCity.slug, file, caption);
            
            if (result.success) {
                showMessage(messageDiv, 'Image uploaded successfully! It will appear after moderation.', 'success');
                form.reset();
                
                // Optionally refresh gallery after upload
                if (result.image) {
                    currentCity.gallery = currentCity.gallery || [];
                    currentCity.gallery.push(result.image);
                    populateGallery(currentCity);
                }
            } else {
                throw new Error(result.error || 'Upload failed');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            showMessage(messageDiv, error.message || 'Failed to upload image. Please try again.', 'error');
        } finally {
            // Re-enable form
            form.querySelectorAll('input, button').forEach(el => {
                el.disabled = false;
            });
        }
    });
    
    // Show file name when selected
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            showMessage(messageDiv, `Selected: ${file.name} (${sizeInMB}MB)`, 'info');
        }
    });
}

// Show message helper
function showMessage(container, message, type) {
    if (!container) return;
    
    container.className = `upload-message show ${type}`;
    container.textContent = message;
    
    // Auto-hide success/info messages after 5 seconds
    if (type !== 'error') {
        setTimeout(() => {
            container.classList.remove('show');
        }, 5000);
    }
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