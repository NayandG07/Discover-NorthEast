// Slider module for image slideshows
export class Slider {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Slider container ${containerId} not found`);
            return;
        }
        
        this.options = {
            autoPlay: options.autoPlay !== false,
            autoPlayInterval: options.autoPlayInterval || 5000,
            showIndicators: options.showIndicators !== false,
            showControls: options.showControls !== false,
            ...options
        };
        
        this.currentIndex = 0;
        this.slides = [];
        this.autoPlayTimer = null;
        
        this.init();
    }
    
    init() {
        this.wrapper = this.container.querySelector('.slides-wrapper');
        this.prevBtn = this.container.querySelector('.slide-prev');
        this.nextBtn = this.container.querySelector('.slide-next');
        this.indicatorsContainer = this.container.querySelector('.slide-indicators');
        
        // Bind event listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
        
        // Touch/swipe support
        this.addSwipeSupport();
    }
    
    loadSlides(images) {
        if (!images || images.length === 0) {
            console.warn('No images provided to slider');
            return;
        }
        
        this.slides = images;
        this.currentIndex = 0;
        
        // Clear existing slides
        this.wrapper.innerHTML = '';
        
        // Create slide elements
        images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;
            
            const img = document.createElement('img');
            img.src = image.src || image;
            img.alt = image.alt || `Slide ${index + 1}`;
            
            // Handle image loading errors
            img.onerror = () => {
                img.src = '/assets/placeholder.jpg';
                img.alt = 'Image not available';
            };
            
            slide.appendChild(img);
            
            // Add caption if provided
            if (image.caption) {
                const caption = document.createElement('div');
                caption.className = 'slide-content';
                caption.innerHTML = `
                    <h2>${image.caption.title || ''}</h2>
                    <p>${image.caption.text || ''}</p>
                `;
                slide.appendChild(caption);
            }
            
            this.wrapper.appendChild(slide);
        });
        
        // Create indicators
        if (this.options.showIndicators && this.indicatorsContainer) {
            this.createIndicators();
        }
        
        // Start autoplay
        if (this.options.autoPlay && this.slides.length > 1) {
            this.startAutoPlay();
        }
        
        // Hide controls if only one slide
        if (this.slides.length <= 1) {
            if (this.prevBtn) this.prevBtn.style.display = 'none';
            if (this.nextBtn) this.nextBtn.style.display = 'none';
        }
    }
    
    createIndicators() {
        this.indicatorsContainer.innerHTML = '';
        
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `slide-indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicatorsContainer.appendChild(indicator);
        });
    }
    
    updateSlides() {
        const slides = this.wrapper.querySelectorAll('.slide');
        const indicators = this.indicatorsContainer?.querySelectorAll('.slide-indicator');
        
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentIndex);
        });
        
        indicators?.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    next() {
        if (this.slides.length <= 1) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateSlides();
        this.resetAutoPlay();
    }
    
    prev() {
        if (this.slides.length <= 1) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateSlides();
        this.resetAutoPlay();
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        this.currentIndex = index;
        this.updateSlides();
        this.resetAutoPlay();
    }
    
    startAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
        }
        
        this.autoPlayTimer = setInterval(() => {
            this.next();
        }, this.options.autoPlayInterval);
    }
    
    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
    
    resetAutoPlay() {
        if (this.options.autoPlay && this.slides.length > 1) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    }
    
    addSwipeSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.next(); // Swipe left
                } else {
                    this.prev(); // Swipe right
                }
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
    
    destroy() {
        this.stopAutoPlay();
        this.wrapper.innerHTML = '';
        if (this.indicatorsContainer) {
            this.indicatorsContainer.innerHTML = '';
        }
    }
}

// Initialize sliders on page load
export function initSliders() {
    // Look for all slideshow containers
    const slideshowContainers = document.querySelectorAll('.slideshow-container');
    
    slideshowContainers.forEach(container => {
        if (container.id) {
            new Slider(container.id);
        }
    });
}

// Utility function to create a simple image carousel
export function createImageCarousel(containerId, images) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="slideshow-container">
            <div class="slides-wrapper"></div>
            <button class="slide-prev" aria-label="Previous slide">❮</button>
            <button class="slide-next" aria-label="Next slide">❯</button>
            <div class="slide-indicators" role="tablist"></div>
        </div>
    `;
    
    const slider = new Slider(containerId);
    slider.loadSlides(images);
    
    return slider;
}