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
                    const curHost = window.location.hostname;
                    const destUrl = new URL(dest, window.location.href);
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
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
    updateFooterYear();

    // 3. Scroll Animations
    if (typeof window.initScrollAnimations === 'function') window.initScrollAnimations();

    // 4. Smooth Scroll
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
                            const headerOffset = header ? header.offsetHeight : (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height-desktop').replace('px', '')) || 75);
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;
                            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                        }
                    } catch (error) { console.warn(`Smooth scroll target not found or invalid: ${targetId}`); }
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
        const delta = 10; 
        const headerHeight = header.offsetHeight;

        const handleScroll = debounce(() => {
            const nowST = window.pageYOffset || document.documentElement.scrollTop;

            if (Math.abs(lastScrollTop - nowST) <= delta && nowST > 0) return;

            if (nowST > lastScrollTop && nowST > headerHeight) {
                header.classList.add('scrolled-down');
            } else {
                 if (nowST <= lastScrollTop || nowST <= headerHeight / 2 ) {
                     header.classList.remove('scrolled-down');
                 }
            }
            lastScrollTop = nowST <= 0 ? 0 : nowST;
        }, 30); 

        window.addEventListener('scroll', handleScroll, { passive: true });
        if (window.pageYOffset <= headerHeight / 2) {
             header.classList.remove('scrolled-down');
        }
    }
    initStickyHeaderBehavior();

    // 6. Phone Number Formatting
    function initPhoneFormatting() {
        const phoneInput = document.getElementById('contact-phone');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', (e) => {
            let input = e.target.value.replace(/\D/g, '');
            let formattedInput = '';
            if (input.length > 0) formattedInput = input.substring(0, 3);
            if (input.length > 3) formattedInput += '-' + input.substring(3, 6);
            if (input.length > 6) formattedInput += '-' + input.substring(6, 10);
            e.target.value = formattedInput;
        });
    }
    initPhoneFormatting();

    // 7. Contact Form Submission Handling & Live Validation
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
        const messageTextarea = document.getElementById('contact-message');
        const charCountDisplay = document.getElementById('message-char-count');

        if (!form || !thankYouMessageDiv || !userNameSpan || !nameInput || !resetButton || !submitButton || !submitButtonTextSpan || !formErrorMessageDiv || !thankYouBackendMessage || !messageTextarea || !charCountDisplay) {
            console.warn('Contact form elements not found. Submission/validation/char count might not work fully.');
            return;
        }

        // Character Count for Textarea
        if (messageTextarea && charCountDisplay) {
            const maxLength = parseInt(messageTextarea.getAttribute('maxlength'), 10);
            const updateCharCount = () => {
                const currentLength = messageTextarea.value.length;
                charCountDisplay.textContent = `${currentLength}/${maxLength}`;
                if (currentLength > maxLength) {
                    charCountDisplay.style.color = 'red';
                     messageTextarea.classList.add('input-error'); // Also mark textarea as error if over limit
                } else if (currentLength > maxLength * 0.9) {
                    charCountDisplay.style.color = 'orange';
                } else {
                    charCountDisplay.style.color = 'var(--color-text-medium)';
                    // Optionally remove error class if within limits, but liveValidateInput will handle this too
                }
            };
            messageTextarea.addEventListener('input', updateCharCount);
            updateCharCount(); // Initial count
        }

        // Live Input Validation Logic
        function liveValidateInput(inputElement) {
            inputElement.classList.remove('input-error', 'input-valid');
            let isValid = true;
            const value = inputElement.value.trim();

            if (inputElement.required && !value) isValid = false;
            if (inputElement.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) isValid = false;
            if (inputElement.tagName === 'SELECT' && inputElement.required && !value) isValid = false;
            if (inputElement.tagName === 'TEXTAREA' && inputElement.maxLength > 0 && value.length > inputElement.maxLength) isValid = false;
            
            const isTouched = inputElement.dataset.touched === "true";

            if (!value && !inputElement.required) return; // Optional and empty, no validation classes

            if (isTouched || form.dataset.submitted === "true") { // Show validation if touched OR form submitted
                if (isValid && value) { // Only show valid if there's a value and it's valid
                     inputElement.classList.add('input-valid');
                } else if (!isValid && (inputElement.required || value)) { // Show error if invalid & (required OR has a value)
                     inputElement.classList.add('input-error');
                }
            }
        }

        const formInputsForLiveValidation = form.querySelectorAll('input, select, textarea');
        formInputsForLiveValidation.forEach(input => {
            input.addEventListener('blur', () => {
                input.dataset.touched = "true";
                liveValidateInput(input);
            });
            // For instant feedback on some types like email or textarea after char count change
            if (input.type === 'email' || input.tagName === 'TEXTAREA') {
                input.addEventListener('input', () => {
                    // No need to set touched here, blur handles that. Input event is for immediate re-validation.
                    liveValidateInput(input);
                });
            }
        });

        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            form.dataset.submitted = "true"; // Mark form as submitted for validation logic
            
            formErrorMessageDiv.style.display = 'none';
            formErrorMessageDiv.textContent = '';

            let isFormFullyValid = true;
            formInputsForLiveValidation.forEach(input => {
                liveValidateInput(input); // Run validation for all fields
                if (input.classList.contains('input-error')) {
                    isFormFullyValid = false;
                }
            });

            if (!isFormFullyValid) {
                formErrorMessageDiv.textContent = 'Please fill out all highlighted required fields correctly.';
                formErrorMessageDiv.style.display = 'block';
                const firstInvalid = form.querySelector('.input-error');
                if (firstInvalid) firstInvalid.focus();
                delete form.dataset.submitted; // Reset submitted flag after handling
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
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    userNameSpan.textContent = nameInput.value.trim() ? nameInput.value.trim().split(' ')[0] : "Valued Client";
                    thankYouBackendMessage.textContent = result.message || 'Your message has been successfully sent.';
                    form.style.display = 'none';
                    thankYouMessageDiv.style.display = 'block';
                    setTimeout(() => thankYouMessageDiv.classList.add('visible'), 10);
                    const headerHeight = document.getElementById('site-header')?.offsetHeight || 75;
                    const messageTop = thankYouMessageDiv.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    window.scrollTo({ top: messageTop, behavior: 'smooth' });
                } else {
                    formErrorMessageDiv.textContent = result.message || 'An unexpected error occurred. Please try again.';
                    formErrorMessageDiv.style.display = 'block';
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
                delete form.dataset.submitted; // Reset submitted flag
            }
        });

        resetButton.addEventListener('click', () => {
            thankYouMessageDiv.classList.remove('visible');
            thankYouMessageDiv.style.display = 'none';
            form.reset(); 
            formInputsForLiveValidation.forEach(el => {
                el.classList.remove('input-error', 'input-valid');
                delete el.dataset.touched;
            });
            delete form.dataset.submitted;
            formErrorMessageDiv.style.display = 'none';
            formErrorMessageDiv.textContent = '';
            form.style.display = 'block';
            if (charCountDisplay && messageTextarea) { // Reset char count
                 const maxLength = parseInt(messageTextarea.getAttribute('maxlength'), 10);
                 charCountDisplay.textContent = `0/${maxLength}`;
                 charCountDisplay.style.color = 'var(--color-text-medium)';
            }
            if (nameInput) nameInput.focus();
        });
    }
    initContactForm();

}); // End DOMContentLoaded
