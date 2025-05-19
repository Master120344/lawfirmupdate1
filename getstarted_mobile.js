// getstarted_mobile.js

// --- Strict Mode & Global Constants ---
"use strict";
const INITIAL_SPLASH_DURATION_MS = 50; // Very brief splash
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
        console.warn("Essential elements for page load not found on Get Started page.");
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

    // No artificial delay beyond the CSS transition for the splash loader
    splashLoader.classList.add('hidden'); // Start hiding immediately
    mainContent.style.visibility = 'visible';
    mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out ${INITIAL_SPLASH_DURATION_MS / 1000}s`; // Delay main content fade-in until splash is gone
    mainContent.style.opacity = '1';
    bodyElement.classList.add('loaded'); // Make body visible

    splashLoader.addEventListener('transitionend', () => {
        if (splashLoader.classList.contains('hidden')) {
             // splashLoader.remove(); // Optional: remove from DOM
        }
    }, { once: true });
}
// Using DOMContentLoaded for faster perceived load, then 'load' for full assets
document.addEventListener('DOMContentLoaded', () => {
    // This can run parts of initPageLoad that don't depend on all assets like images in main content
    // For simplicity here, we'll stick to 'load' for the main sequence.
});
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
            mainContent.style.transition = 'none'; // No transition for instant display from bfcache
            mainContent.style.opacity = '1';
            mainContent.style.visibility = 'visible';
            setTimeout(() => { // Re-apply transition for future interactions
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
            }, 50);
        }
        if (typeof window.initScrollAnimations === 'function') setTimeout(window.initScrollAnimations, 100);
    } else { // Fresh load
        // Ensure content is visible if splash is already gone or wasn't there
        // and initPageLoad might not have run yet or fully completed
        if (mainContent && (!splashLoader || splashLoader.classList.contains('hidden'))) {
             if (mainContent.style.visibility === 'hidden') { // Only if it's still hidden
                mainContent.style.visibility = 'visible';
                mainContent.style.opacity = '1';
            }
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
    function initSmoothScroll() { /* ... same as other pages ... */ }
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

    // 6. Consultation Form Submission Handling
    function initConsultationForm() {
        const consultationForm = document.getElementById('consultation-request-form');
        const consultationSection = document.getElementById('consultation-form-section');
        const thankYouSection = document.getElementById('thank-you-message'); // Corrected ID
        const submitButton = consultationForm ? consultationForm.querySelector('button[type="submit"]') : null;
        const resetButton = document.getElementById('reset-form-button');


        if (!consultationForm || !consultationSection || !thankYouSection || !submitButton || !resetButton) {
            console.warn('Consultation form elements not found. Check IDs: consultation-request-form, consultation-form-section, thank-you-message, reset-form-button, and submit button.');
            return;
        }

        consultationForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual submission for this mock

            if (!consultationForm.checkValidity()) {
                // Find first invalid field and focus it
                const firstInvalid = consultationForm.querySelector(':invalid');
                if(firstInvalid) {
                    firstInvalid.focus();
                    // Optionally, provide a more user-friendly general message
                    // e.g., by adding a summary error message above the form
                }
                return;
            }

            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';


            // Simulate a delay for "submission" then show thank you message
            setTimeout(() => {
                consultationSection.style.opacity = '0'; // Start fade out of form
                consultationSection.style.display = 'none'; // Hide after fade
                
                thankYouSection.style.display = 'block'; // Make visible before animating opacity
                requestAnimationFrame(() => { // Ensure display:block is applied
                    thankYouSection.classList.add('visible'); // Trigger opacity transition
                     // Scroll to the thank you message if it's out of view
                    const headerHeight = document.getElementById('site-header')?.offsetHeight || 70;
                    const messageTop = thankYouSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    window.scrollTo({ top: messageTop, behavior: 'smooth' });
                });

                // Reset button state after "submission"
                // submitButton.disabled = false;
                // submitButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Consultation Request';

            }, 1000); // 1 second "submission" delay
        });

        resetButton.addEventListener('click', () => {
            thankYouSection.classList.remove('visible');
            thankYouSection.style.display = 'none';
            
            consultationForm.reset(); // Clear form fields
            consultationForm.querySelectorAll('[required]').forEach(input => {
                 input.style.borderColor = ''; // Reset border color if modified
            });
            
            consultationSection.style.display = 'block'; // Show the form again
            requestAnimationFrame(() => {
                 consultationSection.style.opacity = '1'; // Fade form back in
            });

            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Consultation Request';

            const firstInput = consultationForm.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus(); // Focus on the first field
        });
    }
    initConsultationForm();

}); // End DOMContentLoaded