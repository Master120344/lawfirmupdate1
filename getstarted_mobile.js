// getstarted_mobile.js

// --- Strict Mode & Global Constants ---
"use strict";
const INITIAL_SPLASH_DURATION_MS = 50;
const PAGE_TRANSITION_ANIMATION_MS = 300;
const CONSULTATION_PHP_SCRIPT_URL = 'send_consultation_request.php'; // New PHP script URL

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

    splashLoader.classList.add('hidden');
    mainContent.style.visibility = 'visible';
    // Delay main content fade-in slightly longer than splash CSS transition to ensure splash is gone
    mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out ${ (INITIAL_SPLASH_DURATION_MS + 10) / 1000}s`;
    mainContent.style.opacity = '1';
    bodyElement.classList.add('loaded');

    splashLoader.addEventListener('transitionend', () => {
        if (splashLoader.classList.contains('hidden')) { /* splashLoader.remove(); */ }
    }, { once: true });
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

    function initPageTransitions() { /* ... (same as previous JS files) ... */
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

    function updateFooterYear() { /* ... (same as previous JS files, e.g., '2025' or dynamic) ... */
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = '2025';
    }
    updateFooterYear();

    if (typeof window.initScrollAnimations === 'function') window.initScrollAnimations();
    function initSmoothScroll() { /* ... (same as previous JS files) ... */ }
    initSmoothScroll();
    function initStickyHeaderBehavior() { /* ... (same as previous JS files) ... */
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

    // Phone Number Formatting
    function initPhoneFormatting() {
        const phoneInput = document.getElementById('phone'); // ID of phone input in getstarted_mobile.html
        if (!phoneInput) return;

        phoneInput.addEventListener('input', (e) => {
            let input = e.target.value.replace(/\D/g, '');
            let formattedInput = '';
            if (input.length > 0) {
                formattedInput = input.substring(0, 3);
            }
            if (input.length > 3) {
                formattedInput += '-' + input.substring(3, 6);
            }
            if (input.length > 6) {
                formattedInput += '-' + input.substring(6, 10);
            }
            e.target.value = formattedInput;
        });
    }
    initPhoneFormatting();

    // Consultation Form Submission Handling
    function initConsultationForm() {
        const form = document.getElementById('consultation-request-form');
        const formWrapper = document.getElementById('consultation-form-wrapper'); // The div containing the form
        const thankYouDiv = document.getElementById('thank-you-message');
        const thankYouBackendMessage = document.getElementById('thank-you-backend-message');
        const submitButton = document.getElementById('consultation-submit-button');
        const submitButtonTextSpan = submitButton ? submitButton.querySelector('.submit-button-text') : null;
        const formErrorMessageDiv = document.getElementById('form-error-message');
        const resetButton = document.getElementById('reset-form-button');

        if (!form || !formWrapper || !thankYouDiv || !thankYouBackendMessage || !submitButton || !submitButtonTextSpan || !formErrorMessageDiv || !resetButton) {
            console.warn('One or more consultation form elements are missing. Check IDs.');
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
                if ((input.type === 'checkbox' && !input.checked) || (input.type !== 'checkbox' && !input.value.trim())) {
                    isValid = false;
                    input.classList.add('input-error');
                } else {
                    input.classList.remove('input-error');
                }
                if (input.type === 'email' && input.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
                    isValid = false;
                    input.classList.add('input-error');
                }
                 if (input.type === 'number' && input.value.trim() && parseInt(input.value) < (parseInt(input.min) || 0) ) {
                    isValid = false;
                    input.classList.add('input-error');
                }
            });

            if (!isValid) {
                formErrorMessageDiv.textContent = 'Please fill out all highlighted required fields correctly.';
                formErrorMessageDiv.style.display = 'block';
                const firstInvalid = form.querySelector('.input-error, [required]:invalid, [required]:placeholder-shown');
                if(firstInvalid) {
                    firstInvalid.focus();
                    // Scroll to error message
                    const errorMsgTop = formErrorMessageDiv.getBoundingClientRect().top + window.pageYOffset - (document.getElementById('site-header')?.offsetHeight || 70) - 20;
                    window.scrollTo({ top: errorMsgTop, behavior: 'smooth' });
                }
                return;
            }

            submitButton.disabled = true;
            submitButtonTextSpan.textContent = 'Sending...';
            const originalButtonIconClass = submitButton.querySelector('i').className;
            submitButton.querySelector('i').className = 'fas fa-spinner fa-spin';

            const formDataObject = {};
            new FormData(form).forEach((value, key) => formDataObject[key] = value);

            try {
                const response = await fetch(CONSULTATION_PHP_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formDataObject)
                });
                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    thankYouBackendMessage.textContent = result.message || 'Your consultation request has been sent successfully!';
                    formWrapper.style.display = 'none'; // Hide form container
                    thankYouDiv.style.display = 'block';
                    setTimeout(() => {
                        thankYouDiv.classList.add('visible'); // Animate in thank you message
                    }, 10);

                    const headerHeight = document.getElementById('site-header')?.offsetHeight || 70;
                    const messageTop = thankYouDiv.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    window.scrollTo({ top: messageTop, behavior: 'smooth' });
                } else {
                    formErrorMessageDiv.textContent = result.message || 'An unexpected error occurred.';
                    formErrorMessageDiv.style.display = 'block';
                    const errorMsgTop = formErrorMessageDiv.getBoundingClientRect().top + window.pageYOffset - (document.getElementById('site-header')?.offsetHeight || 70) - 20;
                    window.scrollTo({ top: errorMsgTop, behavior: 'smooth' });
                }
            } catch (error) {
                console.error('Consultation form submission error:', error);
                formErrorMessageDiv.textContent = 'A network error occurred. Please check your connection.';
                formErrorMessageDiv.style.display = 'block';
                const errorMsgTop = formErrorMessageDiv.getBoundingClientRect().top + window.pageYOffset - (document.getElementById('site-header')?.offsetHeight || 70) - 20;
                window.scrollTo({ top: errorMsgTop, behavior: 'smooth' });
            } finally {
                submitButton.disabled = false;
                submitButtonTextSpan.textContent = 'Submit Consultation Request';
                submitButton.querySelector('i').className = originalButtonIconClass;
            }
        });

        resetButton.addEventListener('click', () => {
            thankYouDiv.classList.remove('visible');
            thankYouDiv.style.display = 'none';
            
            form.reset();
            form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
            formErrorMessageDiv.style.display = 'none';
            formErrorMessageDiv.textContent = '';
            
            formWrapper.style.display = 'block'; // Show form container again
            formWrapper.style.opacity = '1'; // Ensure it's visible

            const firstInput = form.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        });
    }
    initConsultationForm();

}); // End DOMContentLoaded