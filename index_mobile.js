// --- Strict Mode & Global Constants ---
"use strict";
const INITIAL_SPLASH_DURATION_MS = 5000; // 5 seconds for logo splash screen
const PAGE_TRANSITION_ANIMATION_MS = 400; // Duration for page fade out/in

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
        if (mainContent) mainContent.style.visibility = 'visible';
        return;
    }

    // Ensure main content is hidden initially to prevent flash
    // CSS should handle body opacity, but this is an extra safeguard for main content visibility
    mainContent.style.visibility = 'hidden';


    // Hide splash loader after its duration
    setTimeout(() => {
        splashLoader.classList.add('hidden');
        // Make main content visible and trigger body fade-in
        mainContent.style.visibility = 'visible';
        bodyElement.classList.add('loaded');

        // Optional: remove splash loader from DOM after transition
        // splashLoader.addEventListener('transitionend', () => splashLoader.remove(), { once: true });
    }, INITIAL_SPLASH_DURATION_MS);
}

window.addEventListener('load', initPageLoad);

// Handle bfcache (back/forward cache) to ensure splash doesn't reappear incorrectly
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        const splashLoader = document.getElementById('splash-loader');
        const pageTransitionLoader = document.getElementById('page-transition-loader');
        const bodyElement = document.body;
        const mainContent = document.getElementById('main-content');

        if (splashLoader) splashLoader.classList.add('hidden'); // Ensure splash is hidden
        if (pageTransitionLoader) pageTransitionLoader.classList.add('hidden'); // Ensure transition loader is hidden
        if (bodyElement) bodyElement.classList.add('loaded'); // Ensure body is visible
        if (mainContent) mainContent.style.visibility = 'visible'; // Ensure content is visible
    }
});


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.body;
    const mainContent = document.getElementById('main-content'); // Used for fade transitions

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
                if (!destination || destination.startsWith('javascript:')) return;

                // Check if it's a same-origin link
                try {
                    const currentHostname = window.location.hostname;
                    const destinationUrl = new URL(destination, window.location.href);
                    if (destinationUrl.hostname !== currentHostname) {
                        return; // External link, let browser handle
                    }
                } catch (error) { return; /* Invalid URL, let browser handle */ }

                // Avoid re-triggering for same page links (e.g., if JS dynamically updated href)
                const currentPagePath = window.location.pathname.replace(/\/$/, "");
                const destinationPathObject = new URL(destination, window.location.href);
                const destinationPath = destinationPathObject.pathname.replace(/\/$/, "");

                if (destinationPath === currentPagePath && destinationPathObject.hash) { return; } // Allow hash links on same page
                if (destinationPath === currentPagePath && !destinationPathObject.hash) { e.preventDefault(); return; } // Same page, no hash, do nothing

                e.preventDefault();

                // Fade out current page content
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
                mainContent.style.opacity = '0';
                transitionLoader.classList.remove('hidden'); // Show transition loader

                setTimeout(() => {
                    window.location.href = destination;
                }, PAGE_TRANSITION_ANIMATION_MS + 50); // Navigate after fade out + small buffer
            });
        });
    }
    initPageTransitions();

    // 2. Testimonial Carousel
    function initTestimonialCarousel() {
        const carouselWrapper = document.querySelector('.testimonial-carousel-wrapper');
        if (!carouselWrapper) return;

        const carousel = carouselWrapper.querySelector('.testimonial-carousel');
        const items = Array.from(carousel.querySelectorAll('.testimonial-item'));
        const prevButton = carouselWrapper.querySelector('.carousel-control.prev');
        const nextButton = carouselWrapper.querySelector('.carousel-control.next');
        const dotsContainer = carouselWrapper.querySelector('.carousel-dots');

        if (!carousel || items.length === 0) return;

        let currentIndex = 0;
        const totalItems = items.length;
        const TESTIMONIAL_INTERVAL = 7000; // 7 seconds per testimonial
        let autoPlayInterval;

        function updateCarousel(isInitialization = false) {
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;

            if (dotsContainer) {
                Array.from(dotsContainer.children).forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                    dot.setAttribute('aria-pressed', index === currentIndex);
                });
            }

            items.forEach((item, index) => {
                const isActive = index === currentIndex;
                item.classList.toggle('active-testimonial', isActive);
                item.setAttribute('aria-hidden', !isActive);
                item.setAttribute('tabindex', isActive ? '0' : '-1');
                // If not initializing, focus the new active item for accessibility
                if (isActive && !isInitialization) {
                    // item.focus(); // This might be too aggressive, consider based on UX
                }
            });
        }

        function showItem(index) {
            currentIndex = (index + totalItems) % totalItems; // Ensure index is within bounds
            updateCarousel();
        }
        function showNext() { showItem(currentIndex + 1); }
        function showPrev() { showItem(currentIndex - 1); }

        function startAutoPlay() {
            stopAutoPlay();
            if (totalItems > 1) {
                autoPlayInterval = setInterval(showNext, TESTIMONIAL_INTERVAL);
            }
        }
        function stopAutoPlay() { clearInterval(autoPlayInterval); }

        if (nextButton) {
            nextButton.addEventListener('click', () => { showNext(); stopAutoPlay(); });
        }
        if (prevButton) {
            prevButton.addEventListener('click', () => { showPrev(); stopAutoPlay(); });
        }

        if (dotsContainer && totalItems > 1) {
            dotsContainer.innerHTML = ''; // Clear existing dots if any
            for (let i = 0; i < totalItems; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
                dot.setAttribute('role', 'tab'); // ARIA role
                dot.addEventListener('click', () => { showItem(i); stopAutoPlay(); });
                dotsContainer.appendChild(dot);
            }
        }

        // Initial setup
        updateCarousel(true); // Pass true for initialization
        startAutoPlay();

        carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
        carouselWrapper.addEventListener('mouseleave', startAutoPlay);
        carouselWrapper.addEventListener('focusin', stopAutoPlay); // Stop if user focuses inside
        carouselWrapper.addEventListener('focusout', startAutoPlay); // Resume if focus leaves
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
        if (!animatedElements.length || !('IntersectionObserver' in window)) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px', // Trigger a bit before it's fully in view from bottom
            threshold: 0.1
        };

        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.animationDelay) || 0;
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
                if (targetId.length > 1 && targetId.startsWith('#')) {
                    try {
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            e.preventDefault();
                            const header = document.getElementById('site-header');
                            const headerOffset = header ? header.offsetHeight : 70;
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // Extra 20px padding

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: "smooth"
                            });
                        }
                    } catch (error) {
                        console.warn(`Smooth scroll target element not found for selector: ${targetId}`);
                    }
                }
            });
        });
    }
    initSmoothScroll();

    // 6. Sticky Header - Hide on scroll down, show on scroll up
    function initStickyHeaderBehavior() {
        const header = document.getElementById('site-header');
        if (!header) return;

        let lastScrollTop = 0;
        const delta = 10; // Scroll threshold
        const headerHeight = header.offsetHeight;
        let isHeaderHidden = false;

        const handleScroll = debounce(() => {
            const nowScrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (Math.abs(lastScrollTop - nowScrollTop) <= delta) return;

            if (nowScrollTop > lastScrollTop && nowScrollTop > headerHeight) {
                // Scroll Down
                if (!isHeaderHidden) {
                    header.style.transform = `translateY(-${headerHeight}px)`;
                    isHeaderHidden = true;
                }
            } else {
                // Scroll Up or at top
                if (isHeaderHidden || nowScrollTop <= headerHeight) {
                    header.style.transform = 'translateY(0)';
                    isHeaderHidden = false;
                }
            }
            lastScrollTop = nowScrollTop <= 0 ? 0 : nowScrollTop;
        }, 30);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    initStickyHeaderBehavior(); // Enabled this feature for a premium feel

}); // End DOMContentLoaded