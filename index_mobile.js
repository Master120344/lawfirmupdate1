// --- Strict Mode & Global Constants ---
"use strict";
const LOADER_ANIMATION_DURATION_MS = 5000; // 5 seconds for loading bar as requested
const LOADER_FADE_OUT_DELAY_MS = LOADER_ANIMATION_DURATION_MS + 300; // Fade out after bar + buffer
const PAGE_TRANSITION_LOADER_DURATION_MS = 1500; // Shorter for page transitions

// --- Utility Functions ---
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
        if (bodyElement) bodyElement.classList.add('loaded'); // Still show content
        return;
    }

    // Set CSS variable for loading bar animation duration
    document.documentElement.style.setProperty('--loader-display-duration', `${LOADER_ANIMATION_DURATION_MS / 1000}s`);

    // Show body content after loader animation + fade out time
    // The CSS handles the body opacity transition based on its own timing relative to loader duration
    setTimeout(() => {
        bodyElement.classList.add('loaded');
    }, LOADER_ANIMATION_DURATION_MS);


    // Hide loader itself after its animation and a small buffer
    setTimeout(() => {
        loader.classList.add('hidden');
        // Optional: remove loader from DOM after transition to free up resources
        // setTimeout(() => loader.remove(), 1000);
    }, LOADER_FADE_OUT_DELAY_MS);
}

window.addEventListener('load', initPageLoader);

// Handle bfcache (back/forward cache) to ensure loader doesn't reappear incorrectly
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        const loader = document.getElementById('loader');
        const bodyElement = document.body;
        if (loader) loader.classList.add('hidden');
        if (bodyElement) bodyElement.classList.add('loaded'); // Ensure body is visible
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

                // Simple check: if it's a full URL, ensure it's same origin
                try {
                    const currentHostname = window.location.hostname;
                    const destinationUrl = new URL(destination, window.location.href);
                    if (destinationUrl.hostname !== currentHostname) {
                        return; // External link, let browser handle
                    }
                } catch (error) { return; /* Invalid URL, let browser handle */ }

                // Avoid re-triggering for same page links (e.g. if JS dynamically updated href)
                const currentPagePath = window.location.pathname.replace(/\/$/, "");
                const destinationPathObject = new URL(destination, window.location.href);
                const destinationPath = destinationPathObject.pathname.replace(/\/$/, "");

                if (destinationPath === currentPagePath && destinationPathObject.hash) { return; } // Allow hash links
                if (destinationPath === currentPagePath && !destinationPathObject.hash) { e.preventDefault(); return; } // Same page, no hash

                e.preventDefault();
                bodyElement.classList.remove('loaded'); // Fade out current page content
                loader.classList.remove('hidden'); // Show loader

                // Reset loading bar animation if needed (re-inserting element or class toggling)
                const progressBar = loader.querySelector('.loading-bar-progress');
                if (progressBar) {
                    progressBar.style.animation = 'none'; // Reset animation
                    // Trigger reflow to restart animation
                    // eslint-disable-next-line no-unused-expressions
                    progressBar.offsetHeight;
                    progressBar.style.animation = ''; // Re-apply animation from CSS
                }
                // Set a shorter duration for page transition loader bar
                document.documentElement.style.setProperty('--loader-display-duration', `${PAGE_TRANSITION_LOADER_DURATION_MS / 1000}s`);


                setTimeout(() => {
                    window.location.href = destination;
                }, PAGE_TRANSITION_LOADER_DURATION_MS - 200); // Navigate slightly before loader fully hides
            });
        });
    }
    initPageTransitionLoader();

    // 2. Testimonial Carousel (More Advanced)
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
        const TESTIMONIAL_INTERVAL = 8000; // 8 seconds per testimonial
        let autoPlayInterval;

        function updateCarousel() {
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
            // Update active dot
            if (dotsContainer) {
                Array.from(dotsContainer.children).forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
            }
            // Update item active class (if needed for other styling/accessibility)
            items.forEach((item, index) => {
                item.classList.toggle('active-testimonial', index === currentIndex);
                item.setAttribute('aria-hidden', index !== currentIndex);
            });
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
            stopAutoPlay(); // Clear existing interval
            if (totalItems > 1) {
                autoPlayInterval = setInterval(showNext, TESTIMONIAL_INTERVAL);
            }
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        if (nextButton && prevButton) {
            nextButton.addEventListener('click', () => {
                showNext();
                stopAutoPlay(); // Optional: stop autoplay on manual interaction
                // startAutoPlay(); // Or restart it after a delay
            });
            prevButton.addEventListener('click', () => {
                showPrev();
                stopAutoPlay();
            });
        }

        // Create dots
        if (dotsContainer && totalItems > 1) {
            for (let i = 0; i < totalItems; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateCarousel();
                    stopAutoPlay();
                });
                dotsContainer.appendChild(dot);
            }
        }

        // Initial setup
        items.forEach((item, index) => {
             item.setAttribute('aria-hidden', index !== 0);
             if(index !== 0) item.classList.remove('active-testimonial');
        });
        updateCarousel(); // Set initial active dot and position
        startAutoPlay();

        // Pause autoplay on hover (optional)
        carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
        carouselWrapper.addEventListener('mouseleave', startAutoPlay);
    }
    if (document.querySelector('.testimonial-carousel')) {
      initTestimonialCarousel();
    }


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
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.15 // Trigger when 15% of the element is visible
        };

        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.animationDelay) || 0;
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(entry.target); // Animate only once
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => animationObserver.observe(el));
    }
    initScrollAnimations();

    // 5. Smooth Scroll for Anchor Links (if any added dynamically or for specific cases)
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId.length > 1) { // Ensure it's not just "#"
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        const headerOffset = document.getElementById('site-header')?.offsetHeight || 70;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }
                }
            });
        });
    }
    initSmoothScroll();

    // 6. Sticky Header - Basic hide on scroll down, show on scroll up (optional enhancement)
    function initStickyHeaderBehavior() {
        const header = document.getElementById('site-header');
        if (!header) return;

        let lastScrollTop = 0;
        const delta = 5; // Scroll threshold
        const headerHeight = header.offsetHeight;

        const handleScroll = debounce(() => {
            const nowScrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (Math.abs(lastScrollTop - nowScrollTop) <= delta) return; // Ignore small scrolls

            if (nowScrollTop > lastScrollTop && nowScrollTop > headerHeight) {
                // Scroll Down
                header.style.transform = `translateY(-${headerHeight}px)`;
            } else {
                // Scroll Up or at top
                header.style.transform = 'translateY(0)';
            }
            lastScrollTop = nowScrollTop <= 0 ? 0 : nowScrollTop; // For Mobile or negative scrolling
        }, 50); // Debounce scroll event

        window.addEventListener('scroll', handleScroll);
    }
    // initStickyHeaderBehavior(); // Uncomment to enable this feature


    // Add more JS functionalities here as the site grows
    // e.g., FAQ accordions, form validation enhancements, etc.

}); // End DOMContentLoaded