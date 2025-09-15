// City page functionality
import { getCity, getState, uploadImage, getUrlParam, showLoading, showError, escapeHtml } from './data.js';
import { HeroSlider } from './hero-slider.js';
import { initMap } from './map.js';
import { createGallery } from './lightbox.js';

let currentCity = null;
let currentState = null;
let cityHeroSlider = null;

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
        
        // Apply page-specific overrides (e.g., richer copy for Guwahati)
        applyCityOverrides(currentCity);
        
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
        populateExploreNear(cityData);
        populateSidebarImages(cityData);
        populateOtherCities();
        
    } catch (error) {
        console.error('Failed to load city:', error);
        showError(document.getElementById('cityMap'), 'Failed to load city data. Please try again.');
        
        // Show minimal info if available
        document.getElementById('cityName').textContent = 'Error Loading City';
    }
}

// Apply page-specific overrides to enrich copy and presentation
function applyCityOverrides(city) {
    if (!city || !city.slug) return;

    // Enrich Guwahati content with more descriptive copy
    if (city.slug === 'guwahati') {
        // About Guwahati - make it more eye-catchy and detailed
        const aboutText = `Guwahati, the vibrant gateway to Northeast India, blends ancient heritage with a fast-growing urban rhythm. 
Nestled on the banks of the mighty Brahmaputra and framed by green hills, the city is celebrated for the sacred Kamakhya Temple, serene Umananda Island, bustling riverfront ghats, and lively markets brimming with Assamese tea, silk, and crafts. 
Food lovers can savor authentic Assamese thalis, tangy tenga fish, and local sweets, while nature enthusiasts can explore nearby wildlife sanctuaries and sunset cruises. 
Modern cafés, cultural festivals, and a welcoming spirit make Guwahati both a soulful stopover and a destination in its own right.`;

        // History (based on your provided note, expanded slightly for context and readability)
        const historyText = `Ancient Pragjyotishpur of the Kamarupa kingdom, Guwahati is steeped in lore—from the Kamakhya Shakti peetha to legends of Narakasura and Bhagadatta. 
Its strategic location as a river port on the Brahmaputra shaped its fortunes through the ages. In the 17th century, the city witnessed the Ahom–Mughal confrontations, most famously the 1671 Battle of Saraighat led by the Ahom general Lachit Borphukan. 
Under British rule, Guwahati emerged as an administrative and commercial node. After Independence, the city continued to expand; in 1972, Dispur—within Guwahati—became the capital of Assam. 
Today, Guwahati anchors the Northeast as a hub of education, culture, trade, and connectivity, linking the region to the rest of India and beyond.`;

        // Only override if fields are missing or too short; otherwise append to enrich
        if (!city.summary || city.summary.length < 240) {
            city.summary = aboutText;
        } else {
            city.summary = `${city.summary}\n\n${aboutText}`.slice(0, 2000);
        }

        if (!city.history || city.history.length < 240) {
            city.history = historyText;
        } else {
            city.history = `${city.history}\n\n${historyText}`.slice(0, 2500);
        }
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
    const images = (city.featuredImages && city.featuredImages.length) ? city.featuredImages : ['/assets/placeholder.jpg'];

    const slides = images.map((img, index) => ({
        image: img,
        alt: `${city.name} - Image ${index + 1}`,
        title: city.name,
        subtitle: currentState?.name ? `${currentState.name}` : '',
        description: city.summary ? city.summary : ''
    }));

    cityHeroSlider = new HeroSlider('cityHeroSlideshow', {
        autoPlay: true,
        autoPlayInterval: 6000,
        transitionDuration: 1500,
        animationType: 'fade-slide',
        enableParallax: true,
        enableTextAnimation: true,
        enableProgressBar: true,
        enableThumbnails: false,
        pauseOnHover: true
    });
    cityHeroSlider.loadSlides(slides);
}

// Initialize city map with POIs
function initCityMap(city) {
    // Initialize map with city and POIs
    initMap('cityMap', 'city', { city: city });
}

// Populate explore section (Things to Do as cards)
function populateExplore(city) {
    const exploreEl = document.getElementById('cityExplore');
    
    if (!exploreEl) return;
    
    let todoItems = [];
    
    // Custom items for Guwahati
    if (city.slug === 'guwahati') {
        todoItems = [
            {
                title: 'Kamakhya Temple',
                desc: 'Ancient Shakti peetha atop Nilachal Hills with panoramic city views.',
                image: '/assets/todo/kamakhya-temple.jpg'
            },
            {
                title: 'Brahmaputra River Cruise',
                desc: 'Sunset cruises with cultural performances and local cuisine.',
                image: '/assets/todo/river-cruise.jpg'
            },
            {
                title: 'Assam State Museum',
                desc: 'Rich collection of sculptures, manuscripts, and tribal artifacts.',
                image: '/assets/todo/state-museum.jpg'
            },
            {
                title: 'Fancy Bazaar',
                desc: 'Bustling market for Assamese silk, tea, and handicrafts.',
                image: '/assets/todo/fancy-bazaar.jpg'
            },
            {
                title: 'Dipor Bil',
                desc: 'Wetland sanctuary perfect for birdwatching and nature walks.',
                image: '/assets/todo/dipor-bil.jpg'
            },
            {
                title: 'Navagraha Temple',
                desc: 'Unique temple dedicated to nine celestial bodies.',
                image: '/assets/todo/navagraha.jpg'
            }
        ];
    } else if (city.explore && city.explore.length > 0) {
        // Use existing explore data for other cities
        todoItems = city.explore.map(item => ({
            title: item.title,
            desc: item.desc,
            image: '/assets/placeholder.jpg'
        }));
    }
    
    if (todoItems.length === 0) {
        exploreEl.innerHTML = '<p>No activities available yet</p>';
        return;
    }
    
    exploreEl.innerHTML = todoItems.map(item => `
        <div class="todo-card">
            <img src="${item.image}" alt="${escapeHtml(item.title)}" onerror="this.src='/assets/placeholder.jpg'">
            <div class="todo-card-content">
                <h4>${escapeHtml(item.title)}</h4>
                <p>${escapeHtml(item.desc)}</p>
            </div>
        </div>
    `).join('');
}

// Populate sidebar image holders replacing specialties/quick info
function populateSidebarImages(city) {
    const container = document.getElementById('citySidebarImages');
    if (!container) return;

    let images = [];
    if (city.gallery && city.gallery.length) {
        images = city.gallery.map(g => g.url || g).filter(Boolean);
    }
    if (images.length === 0 && city.featuredImages && city.featuredImages.length) {
        images = city.featuredImages;
    }
    if (images.length === 0) {
        images = ['/assets/placeholder.jpg', '/assets/placeholder.jpg', '/assets/placeholder.jpg'];
    }

    const max = Math.min(images.length, 3);
    container.innerHTML = '';
    for (let i = 0; i < max; i++) {
        const img = document.createElement('img');
        img.src = images[i];
        img.alt = `${city.name} photo ${i + 1}`;
        img.onerror = () => { img.src = '/assets/placeholder.jpg'; };
        container.appendChild(img);
    }
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

// Populate Explore Near (linked photo cards)
function populateExploreNear(city) {
    const grid = document.getElementById('exploreNearGrid');
    const titleSpan = document.getElementById('cityNameExploreNear');
    if (titleSpan) titleSpan.textContent = city.name || 'the City';
    if (!grid) return;

    let places = [];
    if ((city.slug || '').toLowerCase() === 'guwahati') {
        // Different places from Things to Do - focusing on nearby attractions outside city
        places = [
            {
                title: 'IIT Guwahati',
                desc: 'A serene, modern campus on the Brahmaputra—architecture, lakes, and greenery.',
                image: '/assets/near/iit-guwahati.jpg',
                link: 'https://www.iitg.ac.in/'
            },
            {
                title: 'Pobitora Wildlife Sanctuary',
                desc: 'A short drive from the city—home to the one-horned rhinoceros and rich birdlife.',
                image: '/assets/near/pobitora.jpg',
                link: 'https://maps.google.com/?q=Pobitora+Wildlife+Sanctuary'
            },
            {
                title: 'Hajo Pilgrimage Site',
                desc: 'Sacred to Hindus, Muslims and Buddhists—30km from Guwahati.',
                image: '/assets/near/hajo.jpg',
                link: 'https://maps.google.com/?q=Hajo+Assam'
            },
            {
                title: 'Madan Kamdev',
                desc: 'Archaeological ruins of ancient temples—the Khajuraho of Assam.',
                image: '/assets/near/madan-kamdev.jpg',
                link: 'https://maps.google.com/?q=Madan+Kamdev'
            },
            {
                title: 'Chandubi Lake',
                desc: 'Natural lake formed by earthquake—perfect for picnics and boating.',
                image: '/assets/near/chandubi.jpg',
                link: 'https://maps.google.com/?q=Chandubi+Lake'
            }
        ];
    }

    // Fallback if images not available
    if (!places.length) {
        places = [
            { title: 'Local Riverfront', desc: 'Evening walks and sunsets by the river.', image: '/assets/placeholder.jpg', link: '#' },
            { title: 'Handloom & Handicrafts', desc: 'Shop local silk, bamboo, and cane craft.', image: '/assets/placeholder.jpg', link: '#' },
            { title: 'City Viewpoint', desc: 'A quick drive for city panoramas.', image: '/assets/placeholder.jpg', link: '#' }
        ];
    }

    grid.innerHTML = places.map(place => `
        <a class="explore-near-card" href="${place.link}" target="_blank" rel="noopener noreferrer">
            <img src="${place.image}" alt="${escapeHtml(place.title)}" onerror="this.src='/assets/placeholder.jpg'">
            <div class="explore-near-card-content">
                <h3>${escapeHtml(place.title)}</h3>
                <p>${escapeHtml(place.desc)}</p>
            </div>
        </a>
    `).join('');
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