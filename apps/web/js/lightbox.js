// Lightbox module for image galleries
export class Lightbox {
    constructor(options = {}) {
        this.options = {
            showCaption: options.showCaption !== false,
            enableKeyboard: options.enableKeyboard !== false,
            enableSwipe: options.enableSwipe !== false,
            ...options
        };
        
        this.images = [];
        this.currentIndex = 0;
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        // Create lightbox element if it doesn't exist
        if (!document.getElementById('lightbox')) {
            this.createLightbox();
        }
        
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = document.getElementById('lightboxImage');
        this.lightboxCaption = document.getElementById('lightboxCaption');
        this.closeBtn = this.lightbox.querySelector('.lightbox-close');
        this.prevBtn = this.lightbox.querySelector('.lightbox-prev');
        this.nextBtn = this.lightbox.querySelector('.lightbox-next');
        
        this.bindEvents();
    }
    
    createLightbox() {
        const lightboxHtml = `
            <div id="lightbox" class="lightbox" aria-hidden="true" role="dialog">
                <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
                <div class="lightbox-content">
                    <img id="lightboxImage" src="" alt="">
                    <div class="lightbox-caption">
                        <p id="lightboxCaption"></p>
                    </div>
                </div>
                <button class="lightbox-prev" aria-label="Previous image">❮</button>
                <button class="lightbox-next" aria-label="Next image">❯</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', lightboxHtml);
    }
    
    bindEvents() {
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
        
        // Click outside to close
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.close();
            }
        });
        
        // Keyboard navigation
        if (this.options.enableKeyboard) {
            document.addEventListener('keydown', (e) => {
                if (!this.isOpen) return;
                
                switch(e.key) {
                    case 'Escape':
                        this.close();
                        break;
                    case 'ArrowLeft':
                        this.prev();
                        break;
                    case 'ArrowRight':
                        this.next();
                        break;
                }
            });
        }
        
        // Touch/swipe support
        if (this.options.enableSwipe) {
            this.addSwipeSupport();
        }
    }
    
    setImages(images) {
        this.images = images.map(img => ({
            src: img.src || img.url || img,
            caption: img.caption || img.alt || '',
            alt: img.alt || img.caption || 'Gallery image'
        }));
    }
    
    open(index = 0) {
        if (this.images.length === 0) return;
        
        this.currentIndex = Math.max(0, Math.min(index, this.images.length - 1));
        this.isOpen = true;
        
        this.updateImage();
        this.lightbox.classList.add('active');
        this.lightbox.setAttribute('aria-hidden', 'false');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Update navigation buttons visibility
        this.updateNavigation();
    }
    
    close() {
        this.isOpen = false;
        this.lightbox.classList.remove('active');
        this.lightbox.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    next() {
        if (this.images.length <= 1) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }
    
    prev() {
        if (this.images.length <= 1) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }
    
    updateImage() {
        const image = this.images[this.currentIndex];
        
        if (!image) return;
        
        // Add loading state
        this.lightboxImage.style.opacity = '0.5';
        
        // Update image
        this.lightboxImage.src = image.src;
        this.lightboxImage.alt = image.alt;
        
        // Update caption
        if (this.options.showCaption && this.lightboxCaption) {
            this.lightboxCaption.textContent = image.caption;
            this.lightboxCaption.parentElement.style.display = image.caption ? 'block' : 'none';
        }
        
        // Remove loading state when image loads
        this.lightboxImage.onload = () => {
            this.lightboxImage.style.opacity = '1';
        };
        
        // Handle image error
        this.lightboxImage.onerror = () => {
            this.lightboxImage.src = '/assets/placeholder.jpg';
            this.lightboxImage.alt = 'Image not available';
            this.lightboxImage.style.opacity = '1';
        };
        
        this.updateNavigation();
    }
    
    updateNavigation() {
        // Show/hide navigation buttons based on number of images
        if (this.images.length <= 1) {
            if (this.prevBtn) this.prevBtn.style.display = 'none';
            if (this.nextBtn) this.nextBtn.style.display = 'none';
        } else {
            if (this.prevBtn) this.prevBtn.style.display = 'block';
            if (this.nextBtn) this.nextBtn.style.display = 'block';
        }
    }
    
    addSwipeSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
        
        this.handleSwipe = () => {
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
    }
}

// Create gallery with lightbox
export function createGallery(containerId, images) {
    const container = document.getElementById(containerId);
    if (!container || !images || images.length === 0) return;
    
    const lightbox = new Lightbox();
    lightbox.setImages(images);
    
    // Clear container
    container.innerHTML = '';
    
    // Create gallery items
    images.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = image.src || image.url || image;
        img.alt = image.alt || image.caption || `Image ${index + 1}`;
        
        // Handle image error
        img.onerror = () => {
            img.src = '/assets/placeholder.jpg';
            img.alt = 'Image not available';
        };
        
        item.appendChild(img);
        
        // Add caption if provided
        if (image.caption) {
            const caption = document.createElement('div');
            caption.className = 'gallery-caption';
            caption.textContent = image.caption;
            item.appendChild(caption);
        }
        
        // Click to open lightbox
        item.addEventListener('click', () => {
            lightbox.open(index);
        });
        
        container.appendChild(item);
    });
    
    return lightbox;
}

// Initialize lightbox for existing galleries
export function initGalleries() {
    const galleries = document.querySelectorAll('.gallery-grid');
    
    galleries.forEach(gallery => {
        const items = gallery.querySelectorAll('.gallery-item');
        if (items.length === 0) return;
        
        const images = Array.from(items).map(item => {
            const img = item.querySelector('img');
            const caption = item.querySelector('.gallery-caption');
            
            return {
                src: img?.src,
                alt: img?.alt,
                caption: caption?.textContent || ''
            };
        });
        
        const lightbox = new Lightbox();
        lightbox.setImages(images);
        
        items.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                lightbox.open(index);
            });
        });
    });
}