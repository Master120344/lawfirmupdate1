// aboutus_mobile.js

// --- Strict Mode & Global Constants ---
"use strict";
const INITIAL_SPLASH_DURATION_MS = 5000; // Consistent splash duration
const PAGE_TRANSITION_ANIMATION_MS = 300;

// --- Utility Functions (Ideally from a shared utils.js) ---
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
        console.warn("Essential elements for page load (splashLoader, body, mainContent) not found on About Us page.");
        if (bodyElement) bodyElement.classList.add('loaded');
        if (mainContent) mainContent.style.visibility = 'visible';
        return;
    }

    mainContent.style.visibility = 'hidden';
    mainContent.style.opacity = '0';

    setTimeout(() => {
        splashLoader.classList.add('hidden');
        mainContent.style.visibility = 'visible';
        mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
        mainContent.style.opacity = '1';
        bodyElement.classList.add('loaded');

        splashLoader.addEventListener('transitionend', () => {
            if (splashLoader.classList.contains('hidden')) {
                // splashLoader.remove();
            }
        }, { once: true });
    }, INITIAL_SPLASH_DURATION_MS);
}

window.addEventListener('load', initPageLoad);

// Handle bfcache
window.addEventListener('pageshow', (event) => {
    const splashLoader = document.getElementById('splash-loader');
    const pageTransitionLoader = document.getElementById('page-transition-loader');
    const bodyElement = document.body;
    const mainContent = document.getElementById('main-content');

    if (splashLoader) splashLoader.classList.add('hidden');
    if (pageTransitionLoader) pageTransitionLoader.classList.add('hidden');

    if (event.persisted) {
        if (bodyElement) bodyElement.classList.add('loaded');
        if (mainContent) {
            mainContent.style.transition = 'none';
            mainContent.style.opacity = '1';
            mainContent.style.visibility = 'visible';
            setTimeout(() => {
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
            }, 50);
        }
        if (typeof initScrollAnimations === 'function') {
            setTimeout(initScrollAnimations, 100);
        }
    } else {
        if (mainContent && !splashLoader?.classList.contains('hidden')) {
            mainContent.style.visibility = 'hidden';
            mainContent.style.opacity = '0';
        } else if (mainContent) {
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
                    if (destinationUrl.hostname !== currentHostname) return;
                } catch (error) { return; }
                const currentPagePath = window.location.pathname.replace(/\/$/, "");
                const destinationPathObject = new URL(destination, window.location.href);
                const destinationPath = destinationPathObject.pathname.replace(/\/$/, "");
                if (destinationPath === currentPagePath && destinationPathObject.hash) return;
                if (destinationPath === currentPagePath && !destinationPathObject.hash) { e.preventDefault(); return; }
                e.preventDefault();
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
                mainContent.style.opacity = '0';
                transitionLoader.classList.remove('hidden');
                setTimeout(() => { window.location.href = destination; }, PAGE_TRANSITION_ANIMATION_MS + 50);
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

    // 3. Scroll-triggered Animations
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if (!animatedElements.length || !('IntersectionObserver' in window)) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
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
            if (!el.classList.contains('is-visible')) animationObserver.observe(el);
        });
    }
    // Expose globally or ensure it's callable by pageshow if needed
    window.initScrollAnimations = initScrollAnimations;
    initScrollAnimations();


    // 4. Smooth Scroll for Anchor Links (if any on this page)
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
                            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                        }
                    } catch (error) { console.warn(`Smooth scroll target not found: ${targetId}`); }
                }
            });
        });
    }
    initSmoothScroll();

    // 5. Sticky Header (if not handled by a global script)
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

    // Add any "About Us" page specific JS here, e.g. accordions for team members etc.

}); // End DOMContentLoaded