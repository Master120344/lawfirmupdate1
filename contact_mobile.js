// contact_mobile.js

// --- Strict Mode & Global Constants ---
"use strict";
const INITIAL_SPLASH_DURATION_MS = 100;
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
        console.warn("Essential elements for page load not found on Contact page.");
        if (bodyElement) bodyElement.classList.add('loaded');
        if (mainContent) {
             mainContent.style.visibility = 'visible';
             mainContent.style.opacity = '1';
        }
        return;
    }

    mainContent.style.visibility = 'hidden';
    mainContent.style.opacity = '0';
    document.documentElement.style.setProperty('--loader-display-duration', `${INITIAL_SPLASH_DURATION_MS / 1000}s`);

    setTimeout(() => {
        splashLoader.classList.add('hidden');
        mainContent.style.visibility = 'visible';
        mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
        mainContent.style.opacity = '1';
        bodyElement.classList.add('loaded');
        splashLoader.addEventListener('transitionend', () => {
            if (splashLoader.classList.contains('hidden')) { /* splashLoader.remove(); */ }
        }, { once: true });
    }, INITIAL_SPLASH_DURATION_MS);
}
window.addEventListener('load', initPageLoad);

// Scroll-triggered Animations
window.initScrollAnimations = function() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (!animatedElements.length || !('IntersectionObserver' in window)) return;
    const observerOptions = { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 };
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
};

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
        if (typeof window.initScrollAnimations === 'function') setTimeout(window.initScrollAnimations, 100);
    } else {
        if (mainContent && splashLoader && !splashLoader.classList.contains('hidden')) {
            mainContent.style.visibility = 'hidden';
            mainContent.style.opacity = '0';
        } else if (mainContent && mainContent.style.visibility === 'hidden') {
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
        }
    }
});

// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');

    // 1. Page Transition Logic
    function initPageTransitions() {
        const transitionLoader = document.getElementById('page-transition-loader');
        if (!transitionLoader || !mainContent) return;
        const internalLinks = document.querySelectorAll(
            'a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([target="_blank"])'
        );
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const dest = link.getAttribute('href');
                if (!dest || dest.startsWith('javascript:')) return;
                try {
                    const curHost = window.location.hostname; const destUrl = new URL(dest, window.location.href);
                    if (destUrl.hostname !== curHost && destUrl.hostname !== "") return;
                } catch (error) { return; }
                const curPath = window.location.pathname.replace(/\/$/, "");
                const destPathObj = new URL(dest, window.location.href);
                const destPath = destPathObj.pathname.replace(/\/$/, "");
                if (destPath === curPath && destPathObj.hash) return;
                if (destPath === curPath && !destPathObj.hash) { e.preventDefault(); return; }
                e.preventDefault();
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
                mainContent.style.opacity = '0';
                transitionLoader.classList.remove('hidden');
                setTimeout(() => { window.location.href = dest; }, PAGE_TRANSITION_ANIMATION_MS + 50);
            });
        });
    }
    initPageTransitions();

    // 2. Footer Year
    function updateFooterYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = '2025'; // As requested
    }
    updateFooterYear();

    // 3. Scroll Animations
    if (typeof window.initScrollAnimations === 'function') window.initScrollAnimations();

    // 4. Smooth Scroll (if anchors are used)
    function initSmoothScroll() { /* ... same as faq_mobile.js ... */ }
    initSmoothScroll();

    // 5. Sticky Header
    function initStickyHeaderBehavior() {
        const header = document.getElementById('site-header');
        if (!header) return;
        let lastScrollTop = 0; const delta = 10; const headerHeight = header.offsetHeight; let isHidden = false;
        const handleScroll = debounce(() => {
            const nowST = window.pageYOffset || document.documentElement.scrollTop;
            if (Math.abs(lastScrollTop - nowST) <= delta) return;
            if (nowST > lastScrollTop && nowST > headerHeight) {
                if (!isHidden) { header.style.transform = `translateY(-${headerHeight}px)`; isHidden = true; }
            } else {
                if (isHidden || nowST <= headerHeight / 2) { header.style.transform = 'translateY(0)'; isHidden = false; }
            }
            lastScrollTop = nowST <= 0 ? 0 : nowST;
        }, 30);
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    initStickyHeaderBehavior();

    // 6. Contact Form Submission Handling
    function initContactForm() {
        const form = document.getElementById('contact-form');
        const thankYouMessageDiv = document.getElementById('thank-you-message');
        const userNameSpan = document.getElementById('thank-you-user-name');
        const nameInput = document.getElementById('contact-name');
        const resetButton = document.getElementById('reset-form-button');


        if (!form || !thankYouMessageDiv || !userNameSpan || !nameInput || !resetButton) {
            console.warn('Contact form elements not found.');
            return;
        }

        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual submission

            // Basic validation check (HTML5 'required' handles most of this)
            let isValid = true;
            form.querySelectorAll('[required]').forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    // Optionally, add a visual cue for invalid fields
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = ''; // Reset border color
                }
            });

            if (!isValid) {
                // alert('Please fill out all required fields.');
                // Find first invalid field and focus it
                const firstInvalid = form.querySelector('[required]:invalid, [required]:placeholder-shown');
                if(firstInvalid) firstInvalid.focus();
                return;
            }


            // Simulate successful submission
            if (nameInput.value.trim()) {
                userNameSpan.textContent = nameInput.value.trim().split(' ')[0]; // Show first name
            } else {
                userNameSpan.textContent = "Valued Client";
            }

            form.style.display = 'none';
            thankYouMessageDiv.style.display = 'block'; // Set display before animation
            setTimeout(() => { // Allow display to apply before opacity transition
                thankYouMessageDiv.classList.add('visible');
            }, 10);


            // Scroll to the thank you message if it's out of view
            const headerHeight = document.getElementById('site-header')?.offsetHeight || 70;
            const messageTop = thankYouMessageDiv.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            window.scrollTo({ top: messageTop, behavior: 'smooth' });
        });

        resetButton.addEventListener('click', () => {
            thankYouMessageDiv.classList.remove('visible');
            thankYouMessageDiv.style.display = 'none';
            form.reset(); // Clear form fields
            form.querySelectorAll('[required]').forEach(input => {
                 input.style.borderColor = ''; // Reset border color
            });
            form.style.display = 'block'; // Show the form again
            if(nameInput) nameInput.focus(); // Focus on the first field
        });
    }
    initContactForm();

}); // End DOMContentLoaded