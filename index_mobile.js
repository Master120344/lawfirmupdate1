// --- Strict Mode & Global Constants ---
"use strict";
const INITIAL_SPLASH_DURATION_MS = 5000; // 5 seconds for logo splash screen
const PAGE_TRANSITION_ANIMATION_MS = 300; // Slightly faster page fade out/in

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

    mainContent.style.visibility = 'hidden'; // Start with content hidden
    mainContent.style.opacity = '0'; // Ensure opacity is 0 initially

    // Hide splash loader after its duration
    setTimeout(() => {
        splashLoader.classList.add('hidden');
        // Make main content visible and trigger body fade-in (CSS handles body opacity)
        mainContent.style.visibility = 'visible';
        mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`; // Faster content fade-in
        mainContent.style.opacity = '1';
        bodyElement.classList.add('loaded'); // This will trigger body's own fast fade if needed

        splashLoader.addEventListener('transitionend', () => {
            if (splashLoader.classList.contains('hidden')) {
                // splashLoader.remove(); // Optional: remove splash loader from DOM
            }
        }, { once: true });
    }, INITIAL_SPLASH_DURATION_MS);
}

window.addEventListener('load', initPageLoad);

// Handle bfcache (back/forward cache) for better UX
window.addEventListener('pageshow', (event) => {
    const splashLoader = document.getElementById('splash-loader');
    const pageTransitionLoader = document.getElementById('page-transition-loader');
    const bodyElement = document.body;
    const mainContent = document.getElementById('main-content');

    // Always ensure splash and transition loaders are hidden on pageshow
    if (splashLoader) splashLoader.classList.add('hidden');
    if (pageTransitionLoader) pageTransitionLoader.classList.add('hidden');

    if (event.persisted) { // Page is from bfcache
        if (bodyElement) {
            bodyElement.classList.add('loaded'); // Ensure body is fully opaque
        }
        if (mainContent) {
            mainContent.style.transition = 'none'; // Remove transition for instant display from bfcache
            mainContent.style.opacity = '1';
            mainContent.style.visibility = 'visible';
            // Re-apply transition for future interactions after a short delay
            setTimeout(() => {
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
            }, 50);
        }
        // Re-initialize any dynamic components that might need it, e.g., scroll animations if they get stuck
        if (typeof initScrollAnimations === 'function') {
             // Small delay to ensure layout is stable
            setTimeout(initScrollAnimations, 100);
        }

    } else { // Page is a fresh load (not from bfcache)
        // Initial load logic is handled by 'load' event, but ensure content is ready
        if (mainContent && !splashLoader?.classList.contains('hidden')) {
            // If splash is still visible, content should be hidden until splash timeout
            mainContent.style.visibility = 'hidden';
            mainContent.style.opacity = '0';
        } else if (mainContent) {
            // If splash is already gone (e.g., very fast load or subsequent navigation)
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
        }
    }
});


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.body;
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
                if (!destination || destination.startsWith('javascript:')) return;

                try {
                    const currentHostname = window.location.hostname;
                    const destinationUrl = new URL(destination, window.location.href);
                    if (destinationUrl.hostname !== currentHostname) {
                        return;
                    }
                } catch (error) { return; }

                const currentPagePath = window.location.pathname.replace(/\/$/, "");
                const destinationPathObject = new URL(destination, window.location.href);
                const destinationPath = destinationPathObject.pathname.replace(/\/$/, "");

                if (destinationPath === currentPagePath && destinationPathObject.hash) { return; }
                if (destinationPath === currentPagePath && !destinationPathObject.hash) { e.preventDefault(); return; }

                e.preventDefault();

                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
                mainContent.style.opacity = '0';
                transitionLoader.classList.remove('hidden');

                setTimeout(() => {
                    window.location.href = destination;
                }, PAGE_TRANSITION_ANIMATION_MS + 50);
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
        const TESTIMONIAL_INTERVAL = 7000;
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
            });
        }

        function showItem(index) {
            currentIndex = (index + totalItems) % totalItems;
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
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalItems; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
                dot.setAttribute('role', 'tab');
                dot.addEventListener('click', () => { showItem(i); stopAutoPlay(); });
                dotsContainer.appendChild(dot);
            }
        }

        updateCarousel(true);
        startAutoPlay();

        carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
        carouselWrapper.addEventListener('mouseleave', startAutoPlay);
        carouselWrapper.addEventListener('focusin', stopAutoPlay);
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
        if (!animatedElements.length || !('IntersectionObserver' in window)) return;

        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >=0 && !el.classList.contains('is-visible')) {
            } else if(rect.top > window.innerHeight || rect.bottom < 0) {
            }
        });


        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
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

        animatedElements.forEach(el => {
            if (!el.classList.contains('is-visible')) {
                animationObserver.observe(el);
            }
        });
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
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;

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

    // 6. Sticky Header
    function initStickyHeaderBehavior() {
        const header = document.getElementById('site-header');
        if (!header) return;

        let lastScrollTop = 0;
        const delta = 10;
        const headerHeight = header.offsetHeight;
        let isHeaderHidden = false;

        const handleScroll = debounce(() => {
            const nowScrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (Math.abs(lastScrollTop - nowScrollTop) <= delta) return;

            if (nowScrollTop > lastScrollTop && nowScrollTop > headerHeight) {
                if (!isHeaderHidden) {
                    header.style.transform = `translateY(-${headerHeight}px)`;
                    isHeaderHidden = true;
                }
            } else {
                if (isHeaderHidden || nowScrollTop <= headerHeight) {
                    header.style.transform = 'translateY(0)';
                    isHeaderHidden = false;
                }
            }
            lastScrollTop = nowScrollTop <= 0 ? 0 : nowScrollTop;
        }, 30);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    initStickyHeaderBehavior();

}); // End DOMContentLoaded