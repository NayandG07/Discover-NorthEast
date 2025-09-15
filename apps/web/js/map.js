// Map module using Leaflet with OpenStreetMap
export class InteractiveMap {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error(`Map container ${containerId} not found`);
            return;
        }
        
        this.options = {
            center: options.center || [26.2006, 92.9376], // Default to Assam
            zoom: options.zoom || 7,
            minZoom: options.minZoom || 5,
            maxZoom: options.maxZoom || 18,
            ...options
        };
        
        this.markers = [];
        this.map = null;
        
        this.init();
    }
    
    init() {
        try {
            // Initialize Leaflet map
            this.map = L.map(this.containerId, {
                center: this.options.center,
                zoom: this.options.zoom,
                minZoom: this.options.minZoom,
                maxZoom: this.options.maxZoom
            });
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);
            
            // Add zoom control
            L.control.zoom({
                position: 'topright'
            }).addTo(this.map);
            
        } catch (error) {
            console.error('Failed to initialize map:', error);
            this.showFallback();
        }
    }
    
    addMarker(location) {
        if (!this.map) return;
        
        const markerOptions = {
            title: location.title || location.name,
            alt: location.title || location.name
        };
        
        // Create custom icon if type is specified
        if (location.type) {
            markerOptions.icon = this.getIconForType(location.type);
        }
        
        const marker = L.marker(
            [location.coords.lat, location.coords.lng],
            markerOptions
        ).addTo(this.map);
        
        // Add popup if description is provided
        if (location.desc || location.description) {
            const popupContent = `
                <div class="map-popup">
                    <h4>${location.title || location.name}</h4>
                    <p>${location.desc || location.description}</p>
                    ${location.link ? `<a href="${location.link}" class="map-popup-link">Learn More →</a>` : ''}
                </div>
            `;
            marker.bindPopup(popupContent);
        }
        
        // Add click handler if provided
        if (location.onClick) {
            marker.on('click', location.onClick);
        }
        
        // Add to markers array
        this.markers.push(marker);
        
        return marker;
    }
    
    addStateMarkers(states) {
        if (!states || states.length === 0) return;
        
        states.forEach(state => {
            this.addMarker({
                title: state.name,
                coords: state.coords,
                description: state.description,
                link: `state.html?slug=${state.slug}`,
                type: 'state',
                onClick: () => {
                    window.location.href = `state.html?slug=${state.slug}`;
                }
            });
        });
        
        // Fit map to show all markers
        this.fitToMarkers();
    }
    
    addCityMarkers(cities) {
        if (!cities || cities.length === 0) return;
        
        cities.forEach(city => {
            this.addMarker({
                title: city.name,
                coords: city.coords,
                description: city.summary,
                link: `city.html?slug=${city.slug}`,
                type: 'city',
                onClick: () => {
                    window.location.href = `city.html?slug=${city.slug}`;
                }
            });
        });
        
        // Fit map to show all markers
        this.fitToMarkers();
    }
    
    addPOIMarkers(pois) {
        if (!pois || pois.length === 0) return;
        
        pois.forEach(poi => {
            this.addMarker({
                title: poi.title,
                coords: poi.coords,
                description: poi.desc,
                type: poi.type || 'poi'
            });
        });
    }
    
    fitToMarkers() {
        if (!this.map || this.markers.length === 0) return;
        
        const group = new L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1));
    }
    
    getIconForType(type) {
        const iconMap = {
            'state': '🏛️',
            'city': '🏙️',
            'temple': '🛕',
            'monastery': '☸️',
            'lake': '🏞️',
            'waterfall': '💧',
            'fort': '🏰',
            'museum': '🏛️',
            'market': '🛍️',
            'park': '🌳',
            'monument': '🗿',
            'viewpoint': '👁️',
            'poi': '📍'
        };
        
        const icon = iconMap[type] || '📍';
        
        return L.divIcon({
            html: `<div class="custom-marker">${icon}</div>`,
            className: `marker-${type}`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
    }
    
    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }
    
    setView(coords, zoom) {
        if (!this.map) return;
        
        this.map.setView([coords.lat, coords.lng], zoom || this.options.zoom);
    }
    
    showFallback() {
        // Show list fallback if map fails to load
        this.container.innerHTML = `
            <div class="map-fallback">
                <p>Interactive map is not available. Please check your internet connection.</p>
            </div>
        `;
    }
    
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers = [];
    }
}

// Create NorthEast India overview map
export function createNEIndiaMap(containerId, states) {
    const map = new InteractiveMap(containerId, {
        center: [26.2006, 92.9376], // Center of NE India
        zoom: 6
    });
    
    if (states && states.length > 0) {
        map.addStateMarkers(states);
    }
    
    return map;
}

// Create state map with cities
export function createStateMap(containerId, state, cities) {
    const map = new InteractiveMap(containerId, {
        center: [state.coords.lat, state.coords.lng],
        zoom: 8
    });
    
    // Add state marker
    map.addMarker({
        title: state.name + ' (Capital: ' + state.capital + ')',
        coords: state.coords,
        description: state.description,
        type: 'state'
    });
    
    // Add city markers
    if (cities && cities.length > 0) {
        map.addCityMarkers(cities);
    }
    
    return map;
}

// Create city map with POIs
export function createCityMap(containerId, city) {
    const map = new InteractiveMap(containerId, {
        center: [city.coords.lat, city.coords.lng],
        zoom: 12
    });
    
    // Add city center marker
    map.addMarker({
        title: city.name + ' City Center',
        coords: city.coords,
        description: city.summary,
        type: 'city'
    });
    
    // Add POI markers
    if (city.pois && city.pois.length > 0) {
        map.addPOIMarkers(city.pois);
    }
    
    return map;
}

// Check if Leaflet is loaded
export function isMapAvailable() {
    return typeof L !== 'undefined';
}

// Initialize map with fallback
export function initMap(containerId, type, data) {
    if (!isMapAvailable()) {
        console.warn('Leaflet library not loaded, showing fallback');
        document.getElementById(containerId).innerHTML = `
            <div class="map-fallback">
                <p>Map functionality requires an internet connection.</p>
            </div>
        `;
        return null;
    }
    
    switch(type) {
        case 'overview':
            return createNEIndiaMap(containerId, data.states);
        case 'state':
            return createStateMap(containerId, data.state, data.cities);
        case 'city':
            return createCityMap(containerId, data.city);
        default:
            return new InteractiveMap(containerId);
    }
}