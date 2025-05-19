// --- Strict Mode & Global Constants ---
"use strict";
const INITIAL_SPLASH_DURATION_MS = 100; // Extremely fast splash
const PAGE_TRANSITION_ANIMATION_MS = 300;

// --- Utility Functions ---
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
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

// --- Initial Page Load & Splash Screen Logic ---
function initPageLoad() {
    const splashLoader = document.getElementById('splash-loader');
    const bodyElement = document.body;
    const mainContent = document.getElementById('main-content');

    if (!splashLoader || !bodyElement || !mainContent) {
        console.warn("Essential elements for page load (splashLoader, body, mainContent) not found.");
        if (bodyElement) bodyElement.classList.add('loaded');
        if (mainContent) {
             mainContent.style.visibility = 'visible';
             mainContent.style.opacity = '1';
        }
        return;
    }

    mainContent.style.visibility = 'hidden';
    mainContent.style.opacity = '0';

    // Set loader display duration for CSS animation if a loading bar is used
    // document.documentElement.style.setProperty('--loader-display-duration', `${INITIAL_SPLASH_DURATION_MS / 1000}s`);

    setTimeout(() => {
        if (splashLoader) { // Check if splashLoader still exists
            splashLoader.classList.add('hidden');
        }
        
        mainContent.style.visibility = 'visible';
        mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
        mainContent.style.opacity = '1';
        bodyElement.classList.add('loaded');

        if (splashLoader) {
            splashLoader.addEventListener('transitionend', () => {
                if (splashLoader.classList.contains('hidden')) {
                    // splashLoader.remove(); // Optional: remove from DOM after hiding
                }
            }, { once: true });
        }
    }, INITIAL_SPLASH_DURATION_MS);
}

window.addEventListener('load', initPageLoad);

// Scroll-triggered Animations (defined globally for access by pageshow)
window.initScrollAnimations = function() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (!animatedElements.length || !('IntersectionObserver' in window)) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px', // Animate a bit before fully in view
        threshold: 0.1
    };
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.animationDelay) || 0;
                setTimeout(() => entry.target.classList.add('is-visible'), delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    animatedElements.forEach(el => {
        if (!el.classList.contains('is-visible')) {
            animationObserver.observe(el);
        }
    });
};


// Handle bfcache (back-forward cache)
window.addEventListener('pageshow', (event) => {
    const splashLoader = document.getElementById('splash-loader');
    const pageTransitionLoader = document.getElementById('page-transition-loader');
    const bodyElement = document.body;
    const mainContent = document.getElementById('main-content');

    // Ensure loaders are hidden on pageshow, especially page transition loader
    if (splashLoader) splashLoader.classList.add('hidden');
    if (pageTransitionLoader) pageTransitionLoader.classList.add('hidden');


    if (event.persisted) { // Page is from bfcache
        if (bodyElement) bodyElement.classList.add('loaded'); // Ensure body is marked loaded
        if (mainContent) {
            // Immediately show content from bfcache without transition, then re-enable transitions
            mainContent.style.transition = 'none';
            mainContent.style.opacity = '1';
            mainContent.style.visibility = 'visible';
            setTimeout(() => { // Re-apply transition for future interactions
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
            }, 50); // Small delay
        }
        // Re-initialize scroll animations if they exist, as elements might be in view
        if (typeof window.initScrollAnimations === 'function') {
            setTimeout(window.initScrollAnimations, 100); // Delay slightly for rendering
        }
         // Re-initialize Google Reviews Carousel if it exists on the page
        if (typeof window.initGoogleReviewsCarousel === 'function') {
            setTimeout(window.initGoogleReviewsCarousel, 100);
        }
    } else { // Page is a fresh load
        // initPageLoad handles initial splash and main content visibility for fresh loads.
        // This block can ensure main content is correctly set if initPageLoad hasn't run or finished.
        if (mainContent && splashLoader && !splashLoader.classList.contains('hidden')) {
            // If splash is still visible, main content should be hidden
            mainContent.style.visibility = 'hidden';
            mainContent.style.opacity = '0';
        } else if (mainContent && mainContent.style.visibility === 'hidden') {
            // If splash is gone (or was never there) and main content is still hidden, show it.
            // This scenario is less likely if initPageLoad works as expected.
            // mainContent.style.visibility = 'visible';
            // mainContent.style.opacity = '1';
            // Note: initPageLoad should be the primary controller for this on fresh load.
        }
    }
});

// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');

    // 1. Page Transition Logic for Internal Links
    function initPageTransitions() {
        const transitionLoader = document.getElementById('page-transition-loader');
        if (!transitionLoader || !mainContent) return;

        const internalLinks = document.querySelectorAll(
            'a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([target="_blank"])'
        );

        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const destination = link.getAttribute('href');
                // Basic checks for invalid or non-navigational links
                if (!destination || destination.startsWith('javascript:void(0)')) return;

                let isExternalOrProtocol = false;
                try {
                    const currentHostname = window.location.hostname;
                    const destinationUrl = new URL(destination, window.location.href); // Resolves relative URLs
                    // Check if hostnames differ (external) or if it's a different protocol (e.g. file://, ftp://)
                    if (destinationUrl.hostname !== currentHostname && destinationUrl.hostname !== "") {
                        isExternalOrProtocol = true;
                    }
                } catch (error) {
                    // Invalid URL, likely not an HTTP/HTTPS link, treat as non-transitional
                    return; 
                }
                if (isExternalOrProtocol) return; // Don't run transition for external links

                // Prevent transition if it's the same page (even with different hash)
                // or just a hash link on the current page.
                const currentPagePath = window.location.pathname.replace(/\/$/, "");
                const destinationPathObject = new URL(destination, window.location.href);
                const destinationPathClean = destinationPathObject.pathname.replace(/\/$/, "");

                // If it's just a hash change on the same page, let smooth scroll handle it.
                if (destinationPathClean === currentPagePath && destinationPathObject.hash) return; 
                
                // If it's a link to the exact same page without a hash, prevent default and do nothing.
                if (destinationPathClean === currentPagePath && !destinationPathObject.hash) {
                    e.preventDefault(); 
                    return; 
                }


                e.preventDefault();
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
                mainContent.style.opacity = '0';
                if (transitionLoader) transitionLoader.classList.remove('hidden'); // Show loader

                setTimeout(() => { window.location.href = destination; }, PAGE_TRANSITION_ANIMATION_MS + 50); // Navigate after fade
            });
        });
    }
    initPageTransitions();

    // 2. Set Current Year in Footer
    function updateFooterYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }
    updateFooterYear();

    // 3. Initialize Scroll Animations
    if (typeof window.initScrollAnimations === 'function') {
        window.initScrollAnimations();
    }

    // 4. Smooth Scroll for Anchor Links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId.length > 1 && targetId.startsWith('#')) { // Ensure it's a valid ID selector
                    try {
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            e.preventDefault();
                            const header = document.getElementById('site-header');
                            // Use getComputedStyle for robust header height, fallback if header not found
                            const headerOffset = header ? header.offsetHeight : 
                                               (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height-mobile').replace('px', '')) || 70);
                            
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // Extra 20px padding

                            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                        }
                    } catch (error) { 
                        console.warn(`Smooth scroll target not found or invalid selector: ${targetId}`, error); 
                    }
                }
            });
        });
    }
    initSmoothScroll();

    // 5. Sticky Header Behavior
    function initStickyHeaderBehavior() {
        const header = document.getElementById('site-header');
        if (!header) return;
        let lastScrollTop = 0;
        const delta = 10; // Min scroll distance to trigger show/hide
        const headerHeight = header.offsetHeight;
        let isHeaderHidden = false;

        const handleScroll = debounce(() => {
            const nowScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Don't do anything if scroll difference is too small
            if (Math.abs(lastScrollTop - nowScrollTop) <= delta) return;

            if (nowScrollTop > lastScrollTop && nowScrollTop > headerHeight) { 
                // Scrolling Down & past header
                if (!isHeaderHidden) {
                    header.style.transform = `translateY(-${headerHeight}px)`;
                    isHeaderHidden = true;
                }
            } else { 
                // Scrolling Up or near top
                if (isHeaderHidden || nowScrollTop <= headerHeight / 2 ) { // Show if hidden OR very near top
                    header.style.transform = 'translateY(0)';
                    isHeaderHidden = false;
                }
            }
            lastScrollTop = nowScrollTop <= 0 ? 0 : nowScrollTop; // For Mobile or negative scrolling
        }, 30); // Debounce scroll events
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    initStickyHeaderBehavior();

    // 6. Google Reviews Carousel (formerly Testimonials)
    // Make it globally accessible for bfcache
    window.initGoogleReviewsCarousel = function() {
        const carouselWrapper = document.querySelector('.testimonial-carousel-wrapper');
        if (!carouselWrapper) return;

        const carousel = carouselWrapper.querySelector('.testimonial-carousel');
        const items = carousel.querySelectorAll('.testimonial-item');
        const prevButton = carouselWrapper.querySelector('.carousel-control.prev');
        const nextButton = carouselWrapper.querySelector('.carousel-control.next');
        const dotsContainer = carouselWrapper.querySelector('.carousel-dots');

        if (!carousel || items.length === 0 || !prevButton || !nextButton || !dotsContainer) {
            // If essential parts are missing, hide controls and exit
            if(prevButton) prevButton.style.display = 'none';
            if(nextButton) nextButton.style.display = 'none';
            if(dotsContainer) dotsContainer.style.display = 'none';
            return;
        }

        let currentIndex = 0;
        const totalItems = items.length;
        let autoPlayInterval;
        const autoPlayDelay = 7000; // 7 seconds

        function updateCarousel() {
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();
        }

        function updateDots() {
            dotsContainer.innerHTML = ''; // Clear existing dots
            for (let i = 0; i < totalItems; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                if (i === currentIndex) {
                    dot.classList.add('active');
                }
                dot.setAttribute('aria-label', `Go to review ${i + 1}`);
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateCarousel();
                    resetAutoPlay();
                });
                dotsContainer.appendChild(dot);
            }
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            updateCarousel();
        }

        function startAutoPlay() {
            stopAutoPlay(); // Clear existing interval before starting a new one
            autoPlayInterval = setInterval(showNext, autoPlayDelay);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        nextButton.addEventListener('click', () => {
            showNext();
            resetAutoPlay();
        });

        prevButton.addEventListener('click', () => {
            showPrev();
            resetAutoPlay();
        });
        
        // Initial setup
        updateCarousel(); // Includes updateDots
        startAutoPlay();

        // Pause autoplay on hover (optional, good for UX)
        carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
        carouselWrapper.addEventListener('mouseleave', startAutoPlay);
        // Pause on focus for accessibility
        carouselWrapper.addEventListener('focusin', stopAutoPlay);
        carouselWrapper.addEventListener('focusout', startAutoPlay);


    }; // End initGoogleReviewsCarousel

    // Initialize it
    if (typeof window.initGoogleReviewsCarousel === 'function') {
        window.initGoogleReviewsCarousel();
    }


}); // End DOMContentLoaded