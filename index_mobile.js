// --- Strict Mode & Global Constants ---
"use strict";
const LOADER_ANIMATION_DURATION_MS = 3000; // Adjusted for a quicker initial load feel
const LOADER_FADE_OUT_DELAY_MS = LOADER_ANIMATION_DURATION_MS + 200;
const PAGE_TRANSITION_LOADER_DURATION_MS = 1200;

// --- Utility Functions ---
// Debounce function (remains the same)
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// --- Initial Page Load & Loader Logic ---
function initPageLoader() {
    const loader = document.getElementById('loader');
    const bodyElement = document.body;

    if (!loader || !bodyElement) {
        console.warn("Loader or body element not found.");
        if (bodyElement) bodyElement.classList.add('loaded');
        return;
    }

    // CSS variable for loading bar is already set via :root, JS can override if needed for specific transitions
    // document.documentElement.style.setProperty('--loader-display-duration', `${LOADER_ANIMATION_DURATION_MS / 1000}s`);
    
    // This timeout should align with the CSS transition for body opacity.
    // The CSS 'body' opacity transition is set to 0.8s.
    // The loader bar animation is controlled by --loader-display-duration.
    // We want the body to start fading in AS the loader bar finishes.
    
    // Option 1: Body fades in after loader bar completes (current CSS approach is time-based from load)
    // If body has 'transition: opacity 0.8s ease-in-out var(--loader-display-duration);'
    // then body.classList.add('loaded') doesn't need a separate timeout.
    // Let's simplify to rely on CSS for body fade-in timing relative to loader.

    // The CSS for body opacity is:
    // transition: opacity 0.8s ease-in-out;
    // body.loaded { opacity: 1; }
    // So we just need to add 'loaded' after the loader bar duration.
    setTimeout(() => {
        bodyElement.classList.add('loaded');
    }, LOADER_ANIMATION_DURATION_MS - 500); // Start body fade-in slightly before bar completes for smoother feel


    // Hide loader element itself after its animation and a small buffer
    setTimeout(() => {
        loader.classList.add('hidden');
        // Optional: setTimeout(() => loader.remove(), 800); // Remove after CSS fade
    }, LOADER_FADE_OUT_DELAY_MS); // This delay is after loader bar finishes + fade time
}

// Listen to 'load' to ensure all assets like images are loaded for the loader
window.addEventListener('load', () => {
    // Set the initial loader duration for the progress bar
    document.documentElement.style.setProperty('--loader-display-duration', `${LOADER_ANIMATION_DURATION_MS / 1000}s`);
    initPageLoader();
});


window.addEventListener('pageshow', (event) => {
    if (event.persisted) { // bfcache
        const loader = document.getElementById('loader');
        const bodyElement = document.body;
        if (loader && !loader.classList.contains('hidden')) {
            // If loader is somehow visible, hide it immediately and ensure body is loaded
            loader.classList.add('hidden');
            // Optional: setTimeout(() => loader.remove(), 800);
        }
        if (bodyElement && !bodyElement.classList.contains('loaded')) {
             bodyElement.classList.add('loaded');
        }
        // Reset any transition-specific loader durations
        document.documentElement.style.setProperty('--loader-display-duration', `${LOADER_ANIMATION_DURATION_MS / 1000}s`);
    }
});


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.body;

    // 1. Page Transition Loader for Internal Links
    function initPageTransitionLoader() {
        const loader = document.getElementById('loader');
        if (!loader) return;

        const internalLinks = document.querySelectorAll(
            'a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([target="_blank"])'
        );

        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const destination = link.getAttribute('href');
                if (!destination) return;

                try {
                    const currentHostname = window.location.hostname;
                    const destinationUrl = new URL(destination, window.location.href);
                    if (destinationUrl.hostname !== currentHostname && destinationUrl.protocol !== "file:") { // Allow file protocol for local dev
                        return; 
                    }
                } catch (error) { return; }

                const currentPagePath = window.location.pathname.replace(/\/$/, "");
                const destinationPathObject = new URL(destination, window.location.href);
                const destinationPath = destinationPathObject.pathname.replace(/\/$/, "");

                if (destinationPath === currentPagePath && destinationPathObject.hash) { return; } 
                if (destinationPath === currentPagePath && !destinationPathObject.hash && !destinationPathObject.search) { e.preventDefault(); return; }

                e.preventDefault();
                bodyElement.classList.remove('loaded'); // Fade out current page
                loader.classList.remove('hidden'); // Show loader

                // Set shorter duration for page transition loader bar
                document.documentElement.style.setProperty('--loader-display-duration', `${PAGE_TRANSITION_LOADER_DURATION_MS / 1000}s`);
                
                const progressBar = loader.querySelector('.loading-bar-progress');
                if (progressBar) {
                    progressBar.style.animation = 'none';
                    progressBar.offsetHeight; // Trigger reflow
                    progressBar.style.animation = ''; 
                }

                setTimeout(() => {
                    window.location.href = destination;
                }, PAGE_TRANSITION_LOADER_DURATION_MS - 150); // Navigate slightly before loader bar completes
            });
        });
    }
    initPageTransitionLoader();

    // 2. Testimonial Carousel
    function initTestimonialCarousel() {
        const carouselWrapper = document.querySelector('.testimonial-carousel-wrapper');
        if (!carouselWrapper) return;

        const carousel = carouselWrapper.querySelector('.testimonial-carousel');
        const items = Array.from(carousel.querySelectorAll('.testimonial-item'));
        const prevButton = carouselWrapper.querySelector('.carousel-control.prev');
        const nextButton = carouselWrapper.querySelector('.carousel-control.next');
        const dotsContainer = carouselWrapper.querySelector('.carousel-dots');
        
        if (!carousel || items.length === 0) {
            if(prevButton) prevButton.style.display = 'none';
            if(nextButton) nextButton.style.display = 'none';
            return;
        }
        if (items.length <= 1) { // Hide controls if only one item
            if(prevButton) prevButton.style.display = 'none';
            if(nextButton) nextButton.style.display = 'none';
            if(dotsContainer) dotsContainer.style.display = 'none';
            items[0]?.classList.add('active-testimonial');
            items[0]?.setAttribute('aria-hidden', 'false');
            return;
        }


        let currentIndex = 0;
        const totalItems = items.length;
        const TESTIMONIAL_INTERVAL = 7000; // 7 seconds
        let autoPlayInterval;

        function updateCarousel(isInitial = false) {
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            items.forEach((item, index) => {
                const isActive = index === currentIndex;
                item.classList.toggle('active-testimonial', isActive);
                item.setAttribute('aria-hidden', !isActive);
                if (!isInitial) { // Avoid focus stealing on load
                    item.setAttribute('tabindex', isActive ? '0' : '-1');
                }
            });

            if (dotsContainer) {
                Array.from(dotsContainer.children).forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                    dot.setAttribute('aria-selected', index === currentIndex);
                });
            }
        }

        function showItem(index) {
            currentIndex = index;
            updateCarousel();
            resetAutoPlay();
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            updateCarousel();
        }
        
        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        function startAutoPlay() {
            stopAutoPlay();
            if (totalItems > 1) {
                autoPlayInterval = setInterval(showNext, TESTIMONIAL_INTERVAL);
            }
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        if (nextButton && prevButton) {
            nextButton.addEventListener('click', () => { showNext(); resetAutoPlay(); });
            prevButton.addEventListener('click', () => { showPrev(); resetAutoPlay(); });
        }

        if (dotsContainer && totalItems > 1) {
            dotsContainer.innerHTML = ''; // Clear existing dots if any
            for (let i = 0; i < totalItems; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                dot.setAttribute('type', 'button');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-controls', `testimonial-item-${i}`); // Assuming items have IDs
                dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => showItem(i));
                dotsContainer.appendChild(dot);
            }
        }
        
        // Initial setup
        items.forEach((item, index) => {
             item.id = `testimonial-item-${index}`; // For aria-controls
             item.setAttribute('role', 'tabpanel');
             if(index !== 0) {
                item.classList.remove('active-testimonial');
                item.setAttribute('aria-hidden', 'true');
                item.setAttribute('tabindex', '-1');
             } else {
                item.classList.add('active-testimonial');
                item.setAttribute('aria-hidden', 'false');
                item.setAttribute('tabindex', '0');
             }
        });

        updateCarousel(true); // Set initial active dot/item and position
        startAutoPlay();

        carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
        carouselWrapper.addEventListener('mouseleave', startAutoPlay);
        carouselWrapper.addEventListener('focusin', stopAutoPlay); // Pause for keyboard users
        carouselWrapper.addEventListener('focusout', startAutoPlay);
    }
    initTestimonialCarousel();


    // 3. Set Current Year in Footer
    function updateFooterYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
    updateFooterYear();

    // 4. Scroll-triggered Animations
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if (!animatedElements.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px', // Trigger a bit sooner
            threshold: 0.1 // 10% visible
        };

        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.animationDelay) || 0;
                    // const animationType = entry.target.dataset.animation; // e.g. 'fade-in-up'
                    // if (animationType) entry.target.classList.add(animationType); // Handled by CSS base classes

                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => animationObserver.observe(el));
    }
    initScrollAnimations();

    // 5. Smooth Scroll for Anchor Links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId.length > 1 && targetId !== "#") { 
                    try {
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            e.preventDefault();
                            const header = document.querySelector('.site-header'); // Use class from HTML
                            const headerOffset = header ? header.offsetHeight : 70;
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: "smooth"
                            });
                        }
                    } catch (err) {
                        console.warn("Smooth scroll target not found or invalid selector:", targetId);
                    }
                }
            });
        });
    }
    initSmoothScroll();

    // 6. Sticky Header Behavior (Optional)
    function initStickyHeaderBehavior() {
        const header = document.querySelector('.site-header'); // Use class from HTML
        if (!header) return;

        let lastScrollTop = 0;
        const delta = 10; 
        const headerHeight = header.offsetHeight;
        let isHeaderHidden = false;

        const handleScroll = debounce(() => {
            const nowScrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (Math.abs(lastScrollTop - nowScrollTop) <= delta && nowScrollTop > headerHeight) return; 

            if (nowScrollTop > lastScrollTop && nowScrollTop > headerHeight) { // Scroll Down
                if (!isHeaderHidden) {
                    header.style.transform = `translateY(-${headerHeight}px)`;
                    isHeaderHidden = true;
                }
            } else { // Scroll Up or at top
                if (isHeaderHidden || nowScrollTop <= headerHeight) {
                    header.style.transform = 'translateY(0)';
                    isHeaderHidden = false;
                }
            }
            lastScrollTop = nowScrollTop <= 0 ? 0 : nowScrollTop;
        }, 20, false); // Short debounce, execute on trailing edge

        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    // initStickyHeaderBehavior(); // Uncomment to enable

}); // End DOMContentLoaded