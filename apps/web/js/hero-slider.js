// Enhanced Hero Slider with Modern Animations
export class HeroSlider {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Hero slider container ${containerId} not found`);
            return;
        }

        // Default options with animation settings
        this.options = {
            autoPlay: options.autoPlay !== false,
            autoPlayInterval: options.autoPlayInterval || 6000,
            transitionDuration: options.transitionDuration || 1500,
            animationType: options.animationType || 'fade-slide', // fade, slide, fade-slide, zoom
            enableParallax: options.enableParallax !== false,
            enableTextAnimation: options.enableTextAnimation !== false,
            enableProgressBar: options.enableProgressBar !== false,
            enableThumbnails: options.enableThumbnails || false,
            pauseOnHover: options.pauseOnHover !== false,
            ...options
        };

        this.currentIndex = 0;
        this.slides = [];
        this.isAnimating = false;
        this.autoPlayTimer = null;
        this.progressTimer = null;
        
        this.init();
    }

    init() {
        // Create slider structure
        this.createSliderStructure();
        
        // Get references to elements
        this.slidesWrapper = this.container.querySelector('.hero-slides-wrapper');
        this.prevBtn = this.container.querySelector('.hero-prev');
        this.nextBtn = this.container.querySelector('.hero-next');
        this.indicatorsContainer = this.container.querySelector('.hero-indicators');
        this.progressBar = this.container.querySelector('.hero-progress-bar');
        this.thumbnailsContainer = this.container.querySelector('.hero-thumbnails');
        
        // Bind events
        this.bindEvents();
        
        // Load default slides
        this.loadDefaultSlides();
    }

    createSliderStructure() {
        this.container.innerHTML = `
            <div class="hero-slider-container">
                <div class="hero-slides-wrapper"></div>
                
                <!-- Navigation Arrows -->
                <button class="hero-nav hero-prev" aria-label="Previous slide">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                </button>
                <button class="hero-nav hero-next" aria-label="Next slide">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                </button>
                
                <!-- Progress Bar -->
                ${this.options.enableProgressBar ? '<div class="hero-progress"><div class="hero-progress-bar"></div></div>' : ''}
                
                <!-- Indicators -->
                <div class="hero-indicators"></div>
                
                <!-- Thumbnails (optional) -->
                ${this.options.enableThumbnails ? '<div class="hero-thumbnails"></div>' : ''}
            </div>
        `;
    }

    loadDefaultSlides() {
        // NORTHEAST STATES SLIDESHOW - FEATURING ALL 8 STATES
        // Replace these image paths with actual images of each state
        const defaultSlides = [
            {
                // ASSAM - SLIDE IMAGE - REPLACE WITH ASSAM IMAGE
                image: 'https://www.ibef.org/assets/images/states/Assam-2.jpg',
                alt: 'Assam - Land of Red Rivers and Blue Hills',
                title: 'Assam',
                subtitle: 'The Gateway to Northeast India',
                description: 'Home to the mighty Brahmaputra, world-famous tea gardens, and the one-horned rhinoceros',
                cta: {
                    text: 'Explore Assam',
                    link: 'state.html?slug=assam'
                }
            },
            {
                // ARUNACHAL PRADESH - SLIDE IMAGE - REPLACE WITH ARUNACHAL IMAGE
                image: 'https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2024/12/16180042/india-places-Tawang-gate.jpg',
                alt: 'Arunachal Pradesh - Land of the Rising Sun',
                title: 'Arunachal Pradesh',
                subtitle: 'Land of the Dawn-Lit Mountains',
                description: 'India\'s easternmost state with pristine valleys, Buddhist monasteries, and diverse tribes',
                cta: {
                    text: 'Discover Arunachal',
                    link: 'state.html?slug=arunachal-pradesh'
                }
            },
            {
                // MEGHALAYA - SLIDE IMAGE - REPLACE WITH MEGHALAYA IMAGE
                image: '/assets/states/meghalaya-hero.jpg',
                alt: 'Meghalaya - Abode of Clouds',
                title: 'Meghalaya',
                subtitle: 'The Abode of Clouds',
                description: 'Experience living root bridges, Asia\'s cleanest village, and the wettest place on Earth',
                cta: {
                    text: 'Visit Meghalaya',
                    link: 'state.html?slug=meghalaya'
                }
            },
            {
                // MANIPUR - SLIDE IMAGE - REPLACE WITH MANIPUR IMAGE
                image: 'https://i.ytimg.com/vi/GzON0-006JI/maxresdefault.jpg',
                alt: 'Manipur - Jewel of India',
                title: 'Manipur',
                subtitle: 'The Jewel of India',
                description: 'Land of the graceful Manipuri dance, floating Loktak Lake, and the Sangai deer',
                cta: {
                    text: 'Explore Manipur',
                    link: 'state.html?slug=manipur'
                }
            },
            {
                // MIZORAM - SLIDE IMAGE - REPLACE WITH MIZORAM IMAGE
                image: 'https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2023/06/16193059/Untitled-design-78.jpg',
                alt: 'Mizoram - Land of the Blue Mountains',
                title: 'Mizoram',
                subtitle: 'Land of the Hill People',
                description: 'Discover bamboo forests, vibrant Mizo culture, and the highest literacy rate in India',
                cta: {
                    text: 'Discover Mizoram',
                    link: 'state.html?slug=mizoram'
                }
            },
            {
                // NAGALAND - SLIDE IMAGE - REPLACE WITH NAGALAND IMAGE
                image: 'https://chalohoppo.com/wp-content/uploads/2023/06/Dzukou-Lily-at-Dzukou-Valley.jpg',
                alt: 'Nagaland - Land of Festivals',
                title: 'Nagaland',
                subtitle: 'Land of Festivals',
                description: 'Home to 16 major tribes, the famous Hornbill Festival, and rich warrior traditions',
                cta: {
                    text: 'Visit Nagaland',
                    link: 'state.html?slug=nagaland'
                }
            },
            {
                // SIKKIM - SLIDE IMAGE - REPLACE WITH SIKKIM IMAGE
                image: 'https://www.tripsavvy.com/thmb/LV9cMvf0PkFRA1hO6-CfTyFBxgs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-606222988-5a823cff1d64040037dfd9a1.jpg',
                alt: 'Sikkim - Land of Mystic Splendour',
                title: 'Sikkim',
                subtitle: 'Small but Beautiful',
                description: 'Gateway to Kanchenjunga, Buddhist monasteries, and India\'s first organic state',
                cta: {
                    text: 'Explore Sikkim',
                    link: 'state.html?slug=sikkim'
                }
            },
            {
                // TRIPURA - SLIDE IMAGE - REPLACE WITH TRIPURA IMAGE
                image: 'https://assets.cntraveller.in/photos/61f7e7522a4c3abc8e111e00/16:9/w_1920,h_1080,c_limit/unakoti%20tripura%20lead.jpg',
                alt: 'Tripura - Land of Diverse Culture',
                title: 'Tripura',
                subtitle: 'Land of Eternal Beauty',
                description: 'Ancient palaces, rock carvings, rich tribal heritage, and the famous Tripura Sundari Temple',
                cta: {
                    text: 'Discover Tripura',
                    link: 'state.html?slug=tripura'
                }
            }
        ];

        this.loadSlides(defaultSlides);
    }

    loadSlides(slidesData) {
        if (!slidesData || slidesData.length === 0) return;
        
        this.slides = slidesData;
        this.currentIndex = 0;
        
        // Clear existing slides
        this.slidesWrapper.innerHTML = '';
        
        // Create slide elements
        slidesData.forEach((slide, index) => {
            const slideElement = this.createSlideElement(slide, index);
            this.slidesWrapper.appendChild(slideElement);
        });
        
        // Create indicators
        this.createIndicators();
        
        // Create thumbnails if enabled
        if (this.options.enableThumbnails) {
            this.createThumbnails();
        }
        
        // Initialize first slide
        this.showSlide(0, true);
        
        // Start autoplay
        if (this.options.autoPlay && this.slides.length > 1) {
            this.startAutoPlay();
        }
    }

    createSlideElement(slide, index) {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'hero-slide';
        slideDiv.dataset.index = index;
        
        slideDiv.innerHTML = `
            <!-- Background Image with Parallax -->
            <div class="hero-slide-bg" data-parallax>
                <img src="${slide.image}" 
                     alt="${slide.alt}" 
                     onerror="this.src='/assets/placeholder-hero.svg'">
                <!-- Overlay -->
                <div class="hero-overlay"></div>
            </div>
            
            <!-- Content -->
            <div class="hero-slide-content">
                <div class="hero-content-inner">
                    ${slide.subtitle ? `<span class="hero-subtitle" data-animate="fadeInUp">${slide.subtitle}</span>` : ''}
                    <h1 class="hero-title" data-animate="fadeInUp" data-delay="200">${slide.title}</h1>
                    ${slide.description ? `<p class="hero-description" data-animate="fadeInUp" data-delay="400">${slide.description}</p>` : ''}
                    ${slide.cta ? `
                        <div class="hero-cta" data-animate="fadeInUp" data-delay="600">
                            <a href="${slide.cta.link}" class="hero-btn">
                                ${slide.cta.text}
                                <svg class="hero-btn-arrow" width="20" height="20" viewBox="0 0 20 20">
                                    <path d="M10 3L8.59 4.41 13.17 9H3v2h10.17l-4.58 4.59L10 17l7-7z"/>
                                </svg>
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        return slideDiv;
    }

    createIndicators() {
        this.indicatorsContainer.innerHTML = '';
        
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'hero-indicator';
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.dataset.index = index;
            
            if (index === 0) {
                indicator.classList.add('active');
            }
            
            this.indicatorsContainer.appendChild(indicator);
        });
    }

    createThumbnails() {
        if (!this.thumbnailsContainer) return;
        
        this.thumbnailsContainer.innerHTML = '';
        
        this.slides.forEach((slide, index) => {
            const thumbnail = document.createElement('button');
            thumbnail.className = 'hero-thumbnail';
            thumbnail.dataset.index = index;
            
            thumbnail.innerHTML = `
                <img src="${slide.image}" alt="${slide.alt}" onerror="this.src='/assets/placeholder-thumb.jpg'">
                <span class="hero-thumbnail-title">${slide.title}</span>
            `;
            
            if (index === 0) {
                thumbnail.classList.add('active');
            }
            
            this.thumbnailsContainer.appendChild(thumbnail);
        });
    }

    bindEvents() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
        
        // Indicators
        this.indicatorsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('hero-indicator')) {
                const index = parseInt(e.target.dataset.index);
                this.goToSlide(index);
            }
        });
        
        // Thumbnails
        if (this.thumbnailsContainer) {
            this.thumbnailsContainer.addEventListener('click', (e) => {
                const thumbnail = e.target.closest('.hero-thumbnail');
                if (thumbnail) {
                    const index = parseInt(thumbnail.dataset.index);
                    this.goToSlide(index);
                }
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
        
        // Pause on hover
        if (this.options.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => this.pause());
            this.container.addEventListener('mouseleave', () => this.resume());
        }
        
        // Touch/Swipe support
        this.addSwipeSupport();
        
        // Parallax effect on mouse move
        if (this.options.enableParallax) {
            this.addParallaxEffect();
        }
    }

    showSlide(index, immediate = false) {
        if (this.isAnimating && !immediate) return;
        
        this.isAnimating = true;
        
        const slides = this.slidesWrapper.querySelectorAll('.hero-slide');
        const indicators = this.indicatorsContainer.querySelectorAll('.hero-indicator');
        const thumbnails = this.thumbnailsContainer?.querySelectorAll('.hero-thumbnail');
        
        // Update slides
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
                if (!immediate) {
                    slide.classList.add(`animate-${this.options.animationType}`);
                }
                this.animateContent(slide);
            } else if (i === this.currentIndex && !immediate) {
                slide.classList.add('leaving');
                setTimeout(() => {
                    slide.classList.remove('active', 'leaving');
                }, this.options.transitionDuration);
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        // Update thumbnails
        thumbnails?.forEach((thumbnail, i) => {
            thumbnail.classList.toggle('active', i === index);
        });
        
        this.currentIndex = index;
        
        // Reset progress bar
        if (this.options.enableProgressBar) {
            this.resetProgressBar();
        }
        
        setTimeout(() => {
            this.isAnimating = false;
        }, immediate ? 0 : this.options.transitionDuration);
    }

    animateContent(slide) {
        if (!this.options.enableTextAnimation) return;
        
        const animatedElements = slide.querySelectorAll('[data-animate]');
        
        animatedElements.forEach(element => {
            const animation = element.dataset.animate;
            const delay = element.dataset.delay || 0;
            
            element.style.animationDelay = `${delay}ms`;
            element.classList.add('animated', animation);
        });
    }

    next() {
        if (this.slides.length <= 1) return;
        
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    prev() {
        if (this.slides.length <= 1) return;
        
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }

    goToSlide(index) {
        if (index < 0 || index >= this.slides.length || index === this.currentIndex) return;
        
        this.showSlide(index);
        this.resetAutoPlay();
    }

    startAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
        }
        
        this.autoPlayTimer = setInterval(() => {
            this.next();
        }, this.options.autoPlayInterval);
        
        // Start progress bar animation
        if (this.options.enableProgressBar && this.progressBar) {
            this.startProgressBar();
        }
    }

    startProgressBar() {
        if (!this.progressBar) return;
        
        this.progressBar.style.transition = 'none';
        this.progressBar.style.width = '0%';
        
        setTimeout(() => {
            this.progressBar.style.transition = `width ${this.options.autoPlayInterval}ms linear`;
            this.progressBar.style.width = '100%';
        }, 50);
    }

    resetProgressBar() {
        if (!this.progressBar) return;
        
        this.progressBar.style.transition = 'none';
        this.progressBar.style.width = '0%';
        
        if (this.options.autoPlay) {
            setTimeout(() => this.startProgressBar(), 50);
        }
    }

    pause() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
        
        if (this.progressBar) {
            const currentWidth = this.progressBar.offsetWidth;
            const containerWidth = this.progressBar.parentElement.offsetWidth;
            const percentage = (currentWidth / containerWidth) * 100;
            this.progressBar.style.width = `${percentage}%`;
            this.progressBar.style.transition = 'none';
        }
    }

    resume() {
        if (this.options.autoPlay && !this.autoPlayTimer) {
            this.startAutoPlay();
        }
    }

    resetAutoPlay() {
        if (this.options.autoPlay && this.slides.length > 1) {
            this.pause();
            this.startAutoPlay();
        }
    }

    addSwipeSupport() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    }

    handleSwipe(startX, startY, endX, endY) {
        const diffX = startX - endX;
        const diffY = startY - endY;
        const threshold = 50;
        
        // Only handle horizontal swipes
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                this.next(); // Swipe left
            } else {
                this.prev(); // Swipe right
            }
        }
    }

    addParallaxEffect() {
        this.container.addEventListener('mousemove', (e) => {
            const activeSlide = this.slidesWrapper.querySelector('.hero-slide.active');
            if (!activeSlide) return;
            
            const parallaxElements = activeSlide.querySelectorAll('[data-parallax]');
            const rect = this.container.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.parallaxSpeed || 0.02;
                const x = (mouseX - centerX) * speed;
                const y = (mouseY - centerY) * speed;
                
                element.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
            });
        });
        
        this.container.addEventListener('mouseleave', () => {
            const parallaxElements = this.container.querySelectorAll('[data-parallax]');
            parallaxElements.forEach(element => {
                element.style.transform = 'translate(0, 0) scale(1.1)';
            });
        });
    }

    destroy() {
        this.pause();
        this.slidesWrapper.innerHTML = '';
        this.indicatorsContainer.innerHTML = '';
        if (this.thumbnailsContainer) {
            this.thumbnailsContainer.innerHTML = '';
        }
    }
}

// Auto-initialize on DOM load if needed
export function initHeroSlider(containerId = 'heroSlideshow', options = {}) {
    return new HeroSlider(containerId, options);
}