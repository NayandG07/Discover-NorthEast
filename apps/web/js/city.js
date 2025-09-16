// City page functionality
import { getCity, getState, uploadImage, getUrlParam, showLoading, showError, escapeHtml } from './data.js';
import { HeroSlider } from './hero-slider.js';
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
        
        const loadingContainer = document.getElementById('placesGrid');
        if (loadingContainer) {
            showLoading(loadingContainer);
        }
        
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
        populatePlacesToVisit(cityData);
        populateThingsToDo(cityData);
        populateExploreMore(cityData);
        populateGallery(cityData);
        
    } catch (error) {
        console.error('Failed to load city:', error);
        
        // Show error in a container that exists
        const errorContainer = document.getElementById('placesGrid') || document.body;
        showError(errorContainer, 'Failed to load city data. Please try again.');
        
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

// Initialize city image slider with enhanced hero slider
function initCitySlider(city) {
    if (!city.featuredImages || city.featuredImages.length === 0) {
        // Use placeholder if no images
        city.featuredImages = ['/assets/placeholder.jpg'];
    }
    
    // Initialize HeroSlider with city-specific configuration
    const heroSlider = new HeroSlider('cityHeroSlideshow', {
        autoPlay: true,
        autoPlayInterval: 5000,
        transitionDuration: 1200,
        animationType: 'fade-slide',
        enableParallax: true,
        enableTextAnimation: false, // No text animation for city images
        enableProgressBar: true,
        enableThumbnails: false,
        pauseOnHover: true
    });
    
    // Transform featuredImages into hero slider format
    const slides = city.featuredImages.map((img, index) => ({
        image: img,
        alt: `${city.name} - Image ${index + 1}`,
        title: '', // No title overlay for city images
        subtitle: '',
        description: '',
        cta: null // No CTA button for city images
    }));
    
    heroSlider.loadSlides(slides);
}

// Initialize city map with POIs
function initCityMap(city) {
    // Initialize map with city and POIs
    initMap('cityMap', 'city', { city: city });
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

// Populate Places to Visit section
function populatePlacesToVisit(city) {
    const placesGrid = document.getElementById('placesGrid');
    
    if (!placesGrid) return;
    
    // Extract places from explore data or use predefined places
    let places = [];
    
    if (city.explore && city.explore.length > 0) {
        places = city.explore.map((item, index) => ({
            title: item.title,
            description: item.desc,
            image: getPlaceImage(item.title, city.name, index)
        }));
    } else {
        // Default places based on city
        places = getDefaultPlaces(city.name);
    }
    
    placesGrid.innerHTML = places.map(place => `
        <div class="place-card">
            <img src="${place.image}" alt="${escapeHtml(place.title)}" onerror="this.src='/assets/placeholder.jpg'">
            <div class="place-card-content">
                <h3>${escapeHtml(place.title)}</h3>
                <p>${escapeHtml(place.description)}</p>
            </div>
        </div>
    `).join('');
}

// Populate Things to Do section
function populateThingsToDo(city) {
    const thingsGrid = document.getElementById('thingsGrid');
    
    if (!thingsGrid) return;
    
    // Get things to do data
    const thingsToDo = getThingsToDoData(city.name);
    
    thingsGrid.innerHTML = thingsToDo.map(thing => `
        <div class="thing-item">
            <div class="thing-image">
                <img src="${thing.image}" alt="${escapeHtml(thing.title)}" onerror="this.src='/assets/placeholder.jpg'">
            </div>
            <div class="thing-content">
                <h3>${escapeHtml(thing.title)}</h3>
                <p>${escapeHtml(thing.description)}</p>
                ${thing.hasLink ? `<a href="#" class="visit-link">Visit →</a>` : ''}
            </div>
        </div>
    `).join('');
}

// Populate Explore More section
function populateExploreMore(city) {
    const exploreMoreGrid = document.getElementById('exploreMoreGrid');
    const exploreMoreTitle = document.getElementById('exploreMoreTitle');
    
    if (!exploreMoreGrid) return;
    
    // Update title with city name
    if (exploreMoreTitle) {
        exploreMoreTitle.textContent = `Explore More Near ${city.name}`;
    }
    
    // Get nearby places data
    const nearbyPlaces = getNearbyPlacesData(city.name);
    
    exploreMoreGrid.innerHTML = nearbyPlaces.map(place => `
        <div class="explore-item">
            <img src="${place.image}" alt="${escapeHtml(place.title)}" onerror="this.src='/assets/placeholder.jpg'">
            <div class="explore-item-content">
                <h3>${escapeHtml(place.title)}</h3>
                <p>${escapeHtml(place.description)}</p>
            </div>
        </div>
    `).join('');
}

// Get appropriate image for places
function getPlaceImage(placeName, cityName, index) {
    const name = placeName.toLowerCase();
    const city = cityName.toLowerCase();
    
    // Mapping for specific places
    const imageMap = {
        'kamakhya temple': '/assets/assam/Kamakhya/pic_00000.png',
        'kaziranga national park': '/assets/assam/Kaziranga/images.jpg',
        'majuli island': '/assets/assam/Majuli/images.png',
        'sivasagar': '/assets/assam/sivsagar/images (1) (1).jpg',
        'rang ghar': '/assets/assam/sivsagar/rang-ghar.jpg',
        'state museum': '/assets/placeholder.jpg',
        'umananda island': '/assets/placeholder.jpg',
        'brahmaputra river cruise': '/assets/placeholder.jpg'
    };
    
    return imageMap[name] || `/assets/placeholder.jpg`;
}

// Get default places for cities
function getDefaultPlaces(cityName) {
    const defaultPlacesMap = {
        'Guwahati': [
            { title: 'Kamakhya Temple', description: 'One of the 51 Shakti Peethas, this ancient temple is a major pilgrimage site', image: '/assets/assam/Kamakhya/pic_00000.png' },
            { title: 'Umananda Island', description: 'Visit the world\'s smallest inhabited river island with its Shiva temple', image: '/assets/placeholder.jpg' },
            { title: 'State Museum', description: 'Explore Assam\'s rich cultural heritage and artifacts', image: '/assets/placeholder.jpg' },
            { title: 'Brahmaputra River Cruise', description: 'Enjoy sunset cruises on the mighty Brahmaputra River', image: '/assets/placeholder.jpg' }
        ]
    };
    
    return defaultPlacesMap[cityName] || [
        { title: 'Local Attractions', description: 'Discover beautiful places in the city', image: '/assets/placeholder.jpg' },
        { title: 'Cultural Sites', description: 'Experience local culture and traditions', image: '/assets/placeholder.jpg' },
        { title: 'Natural Beauty', description: 'Enjoy the scenic landscapes and nature', image: '/assets/placeholder.jpg' }
    ];
}

// Get things to do data for cities
function getThingsToDoData(cityName) {
    const thingsToDoMap = {
        'Guwahati': [
            {
                title: 'State Museum',
                description: 'The Assam State Museum houses an impressive collection of sculptures, manuscripts, tribal artifacts, and historical items that showcase the rich cultural heritage of Northeast India. Established in 1940, it features sections on epigraphy, ethnography, and natural history.',
                image: '/assets/placeholder.jpg',
                hasLink: false
            },
            {
                title: 'River Cruise',
                description: 'Sunset cruises with cultural performances.',
                image: '/assets/placeholder.jpg',
                hasLink: false
            }
        ]
    };
    
    return thingsToDoMap[cityName] || [
        {
            title: 'Local Experiences',
            description: 'Discover unique local experiences and cultural activities that showcase the authentic spirit of the region.',
            image: '/assets/placeholder.jpg',
            hasLink: false
        },
        {
            title: 'Adventure Activities',
            description: 'Enjoy various adventure activities and outdoor experiences in beautiful natural settings.',
            image: '/assets/placeholder.jpg',
            hasLink: false
        }
    ];
}

// Get nearby places data
function getNearbyPlacesData(cityName) {
    const nearbyPlacesMap = {
        'Guwahati': [
            { title: 'Chandubi Lake', description: 'Natural lake for picnics (64km).', image: '/assets/placeholder.jpg' },
            { title: 'Madan Kamdev', description: 'Archaeological ruins (40km).', image: '/assets/placeholder.jpg' }
        ]
    };
    
    return nearbyPlacesMap[cityName] || [
        { title: 'Nearby Attraction 1', description: 'Interesting place near the city', image: '/assets/placeholder.jpg' },
        { title: 'Nearby Attraction 2', description: 'Another beautiful destination', image: '/assets/placeholder.jpg' }
    ];
}

// Populate other cities (function removed as per requirements)
function populateOtherCities() {
    // This function is no longer used since "Explore More Cities" section 
    // has been removed from the footer as per requirements
    return;
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