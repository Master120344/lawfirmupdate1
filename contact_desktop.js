// contact_desktop.js

// --- Strict Mode & Global Constants ---
"use strict";
const INITIAL_SPLASH_DURATION_MS = 100;
const PAGE_TRANSITION_ANIMATION_MS = 300;
const PHP_SCRIPT_URL = 'send_email.php'; // URL for the PHP mailer script

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
    const observerOptions = { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 }; // Adjust rootMargin for desktop if needed
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
            mainContent.style.transition = 'none'; // Disable transition for immediate show
            mainContent.style.opacity = '1';
            mainContent.style.visibility = 'visible';
            setTimeout(() => { // Re-enable transition after a tick
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
            }, 50);
        }
        if (typeof window.initScrollAnimations === 'function') setTimeout(window.initScrollAnimations, 100); // Re-run animations
    } else {
        // For non-persisted (normal) loads, initPageLoad handles visibility.
        // This ensures content isn't prematurely shown if initPageLoad is still managing it.
        if (mainContent && splashLoader && !splashLoader.classList.contains('hidden')) {
            mainContent.style.visibility = 'hidden';
            mainContent.style.opacity = '0';
        } else if (mainContent && mainContent.style.visibility === 'hidden') {
            // This state implies initPageLoad might not have run or completed fully
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
                if (!dest || dest.startsWith('javascript:')) return; // Ignore JS links
                try { // Check if it's an external link
                    const curHost = window.location.hostname;
                    const destUrl = new URL(dest, window.location.href);
                    if (destUrl.hostname !== curHost && destUrl.hostname !== "") return; // Allow relative paths (hostname will be "")
                } catch (error) { return; } // Invalid URL, let browser handle
                
                const curPath = window.location.pathname.replace(/\/$/, ""); // Normalize current path
                const destPathObj = new URL(dest, window.location.href);
                const destPath = destPathObj.pathname.replace(/\/$/, ""); // Normalize destination path

                if (destPath === curPath && destPathObj.hash) return; // Allow same-page anchor links
                if (destPath === curPath && !destPathObj.hash) { e.preventDefault(); return; } // Prevent reload of same page without hash

                e.preventDefault();
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
                mainContent.style.opacity = '0';
                transitionLoader.classList.remove('hidden');
                setTimeout(() => { window.location.href = dest; }, PAGE_TRANSITION_ANIMATION_MS + 50); // Add a small buffer
            });
        });
    }
    initPageTransitions();

    // 2. Footer Year
    function updateFooterYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear(); // Dynamically set current year
        }
    }
    updateFooterYear();

    // 3. Scroll Animations
    if (typeof window.initScrollAnimations === 'function') window.initScrollAnimations();

    // 4. Smooth Scroll (if anchors are used)
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
                            // Use desktop header height from CSS variable, fallback if not set
                            const headerOffset = header ? header.offsetHeight : (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height-desktop').replace('px', '')) || 75);
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // 20px buffer
                            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                        }
                    } catch (error) { console.warn(`Smooth scroll target not found or invalid: ${targetId}`); }
                }
            });
        });
    }
    initSmoothScroll();

    // 5. Sticky Header (Desktop often doesn't hide header, but keeping logic if needed)
    function initStickyHeaderBehavior() {
        const header = document.getElementById('site-header');
        if (!header) return;
        // Option: Disable hide-on-scroll for desktop, or adjust behavior
        // For example, some desktop headers change style (e.g., shrink, different background) on scroll.
        // The current logic hides it completely.
        let lastScrollTop = 0;
        const delta = 10; // Scroll threshold
        const headerHeight = header.offsetHeight;
        let isHidden = false;

        const handleScroll = debounce(() => {
            const nowST = window.pageYOffset || document.documentElement.scrollTop;
            if (Math.abs(lastScrollTop - nowST) <= delta) return;

            if (nowST > lastScrollTop && nowST > headerHeight) { // Scrolling down
                if (!isHidden) {
                    // header.style.transform = `translateY(-${headerHeight}px)`; // Hide
                    // isHidden = true;
                    // OR: Add class for "scrolled" state
                    header.classList.add('scrolled-down');
                }
            } else { // Scrolling up or at top
                if (isHidden || nowST <= headerHeight / 2) {
                    // header.style.transform = 'translateY(0)'; // Show
                    // isHidden = false;
                    header.classList.remove('scrolled-down');
                }
            }
            lastScrollTop = nowST <= 0 ? 0 : nowST;
        }, 30); // Debounce time

        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    initStickyHeaderBehavior(); // Call if you want this behavior on desktop

    // 6. Phone Number Formatting
    function initPhoneFormatting() {
        const phoneInput = document.getElementById('contact-phone');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', (e) => {
            let input = e.target.value.replace(/\D/g, ''); // Remove all non-digits
            
            let formattedInput = '';
            if (input.length > 0) {
                formattedInput = input.substring(0, 3);
            }
            if (input.length > 3) {
                formattedInput += '-' + input.substring(3, 6);
            }
            if (input.length > 6) {
                formattedInput += '-' + input.substring(6, 10); // Max 10 digits for XXX-XXX-XXXX
            }
            
            e.target.value = formattedInput;
        });
    }
    initPhoneFormatting();

    // 7. Contact Form Submission Handling
    function initContactForm() {
        const form = document.getElementById('contact-form');
        const thankYouMessageDiv = document.getElementById('thank-you-message');
        const userNameSpan = document.getElementById('thank-you-user-name');
        const nameInput = document.getElementById('contact-name');
        const resetButton = document.getElementById('reset-form-button');
        const submitButton = document.getElementById('form-submit-button');
        const submitButtonTextSpan = submitButton ? submitButton.querySelector('.submit-button-text') : null;
        const formErrorMessageDiv = document.getElementById('form-error-message');
        const thankYouBackendMessage = document.getElementById('thank-you-backend-message');

        if (!form || !thankYouMessageDiv || !userNameSpan || !nameInput || !resetButton || !submitButton || !submitButtonTextSpan || !formErrorMessageDiv || !thankYouBackendMessage) {
            console.warn('Contact form elements not found for desktop. Submission handling will not work.');
            return;
        }

        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            formErrorMessageDiv.style.display = 'none';
            formErrorMessageDiv.textContent = '';
            form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('input-error');
                } else {
                    input.classList.remove('input-error');
                }
                if (input.type === 'email' && input.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
                    isValid = false;
                    input.classList.add('input-error');
                }
            });

            if (!isValid) {
                formErrorMessageDiv.textContent = 'Please fill out all highlighted required fields correctly.';
                formErrorMessageDiv.style.display = 'block';
                const firstInvalid = form.querySelector('.input-error, [required]:invalid, [required]:placeholder-shown');
                if(firstInvalid) firstInvalid.focus();
                return;
            }

            submitButton.disabled = true;
            submitButtonTextSpan.textContent = 'Sending...';
            const originalButtonIconClass = submitButton.querySelector('i').className;
            submitButton.querySelector('i').className = 'fas fa-spinner fa-spin';

            const formData = {
                name: form.elements['name'].value,
                email: form.elements['email'].value,
                phone: form.elements['phone'].value,
                service: form.elements['service'].value,
                message: form.elements['message'].value,
            };

            try {
                const response = await fetch(PHP_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    if (nameInput.value.trim()) {
                        userNameSpan.textContent = nameInput.value.trim().split(' ')[0];
                    } else {
                        userNameSpan.textContent = "Valued Client";
                    }
                    thankYouBackendMessage.textContent = result.message || 'Your message has been successfully sent.';
                    form.style.display = 'none';
                    thankYouMessageDiv.style.display = 'block';
                    setTimeout(() => {
                        thankYouMessageDiv.classList.add('visible');
                    }, 10);

                    const headerHeight = document.getElementById('site-header')?.offsetHeight || 75;
                    const messageTop = thankYouMessageDiv.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    window.scrollTo({ top: messageTop, behavior: 'smooth' });
                } else {
                    formErrorMessageDiv.textContent = result.message || 'An unexpected error occurred. Please try again.';
                    formErrorMessageDiv.style.display = 'block';
                     // Scroll to the error message if it's out of view
                    const errorMsgTop = formErrorMessageDiv.getBoundingClientRect().top + window.pageYOffset - (document.getElementById('site-header')?.offsetHeight || 75) - 20;
                    window.scrollTo({ top: errorMsgTop, behavior: 'smooth' });
                }

            } catch (error) {
                console.error('Form submission error:', error);
                formErrorMessageDiv.textContent = 'A network error occurred. Please check your connection and try again.';
                formErrorMessageDiv.style.display = 'block';
                const errorMsgTop = formErrorMessageDiv.getBoundingClientRect().top + window.pageYOffset - (document.getElementById('site-header')?.offsetHeight || 75) - 20;
                window.scrollTo({ top: errorMsgTop, behavior: 'smooth' });
            } finally {
                submitButton.disabled = false;
                submitButtonTextSpan.textContent = 'Send Inquiry';
                submitButton.querySelector('i').className = originalButtonIconClass;
            }
        });

        resetButton.addEventListener('click', () => {
            thankYouMessageDiv.classList.remove('visible');
            thankYouMessageDiv.style.display = 'none';
            form.reset(); 
            form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
            formErrorMessageDiv.style.display = 'none';
            formErrorMessageDiv.textContent = '';
            form.style.display = 'block';
            if(nameInput) nameInput.focus();
        });
    }
    initContactForm();

}); // End DOMContentLoaded