// index_mobile.js

function initSplashAndContent() {
    const splashLoader = document.getElementById('splash-loader');
    const mainContent = document.getElementById('main-content');
    const siteHeader = document.getElementById('site-header');
    const body = document.body;

    // If already loaded (e.g., from bfcache and logic ran), don't re-run splash
    if (body.classList.contains('loaded') && splashLoader && splashLoader.classList.contains('hidden')) {
        if (mainContent) mainContent.style.visibility = 'visible';
        if (siteHeader) siteHeader.style.transform = 'translateY(0)';
        return;
    }
    
    if (splashLoader) {
        splashLoader.classList.remove('hidden');
        if (mainContent) mainContent.style.visibility = 'hidden';
        if (siteHeader) siteHeader.style.transform = 'translateY(-100%)';

        let loaderDuration = 2500;
        const loaderDurationCSS = getComputedStyle(document.documentElement).getPropertyValue('--loader-display-duration').trim();
        if (loaderDurationCSS) {
            const parsedSeconds = parseFloat(loaderDurationCSS.replace('s', ''));
            if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
                loaderDuration = parsedSeconds * 1000;
            }
        }
        
        const loadingBarProgress = splashLoader.querySelector('.loading-bar-progress');
        if(loadingBarProgress && loaderDurationCSS) {
             loadingBarProgress.style.animationDuration = loaderDurationCSS;
        }

        setTimeout(() => {
            splashLoader.classList.add('hidden');
            if (mainContent) {
                mainContent.style.visibility = 'visible';
            }
            if (siteHeader) {
                 siteHeader.style.transform = 'translateY(0)';
            }
            body.classList.add('loaded');
        }, loaderDuration);
    } else {
        if (mainContent) mainContent.style.visibility = 'visible';
        if (siteHeader) siteHeader.style.transform = 'translateY(0)';
        body.classList.add('loaded');
    }
}

function initPageTransitions() {
    const pageTransitionLoader = document.getElementById('page-transition-loader');
    if (pageTransitionLoader) {
        const allInternalLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"]):not([target="_blank"])');
        allInternalLinks.forEach(link => {
            // Check if listener already attached to prevent duplicates if this function is called multiple times
            if (link.dataset.pageTransitionAttached) return;

            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && (href.startsWith('.') || href.startsWith('/') || !href.includes(':'))) {
                    // Prevent default navigation if it's the current page without a hash
                    const currentPath = window.location.pathname.split('/').pop();
                    const targetPath = href.split('/').pop().split('#')[0]; // Get filename part of href
                    if (currentPath === targetPath && !href.includes('#')) {
                        if (currentPath === '' && targetPath === 'index_mobile.html' && !href.includes('#')){
                            // Allow if current is root and target is index_mobile.html
                        } else {
                            e.preventDefault(); 
                            return; // Don't show loader for same-page clicks without hash
                        }
                    }

                    e.preventDefault();
                    pageTransitionLoader.classList.remove('hidden');
                    setTimeout(() => {
                        window.location.href = href;
                    }, 250);
                }
            });
            link.dataset.pageTransitionAttached = 'true'; // Mark as attached
        });

        // This pageshow listener specifically handles the pageTransitionLoader
        window.addEventListener('pageshow', function(event) {
            pageTransitionLoader.classList.add('hidden');
        });
    }
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0 && "IntersectionObserver" in window) {
        // Clear existing visible classes if re-initializing for bfcache
        animatedElements.forEach(el => el.classList.remove('is-visible'));

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.dataset.animationDelay) || 0;
                    setTimeout(() => {
                        el.classList.add('is-visible');
                    }, delay);
                    observerInstance.unobserve(el);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }
}

function initFooterYear() {
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

function initMobileNavActiveTab() {
    const mobileTabs = document.querySelectorAll('.mobile-tabs .tab-item');
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '' && window.location.pathname.endsWith('/')) { // Handles root path properly
        currentPage = 'index_mobile.html'; // Assume index_mobile.html for root
    }


    mobileTabs.forEach(tab => {
        const tabTarget = tab.getAttribute('href');
        tab.classList.remove('active');
        tab.removeAttribute('aria-current');
        if (tabTarget === currentPage || (currentPage === 'index_mobile.html' && tabTarget === 'index_mobile.html')) { // Explicit check for index
            tab.classList.add('active');
            tab.setAttribute('aria-current', 'page');
        }
    });
}

// Main DOMContentLoaded Function
function onDomReady() {
    initSplashAndContent();
    initPageTransitions();
    initScrollAnimations();
    initFooterYear();
    initMobileNavActiveTab();
}

document.addEventListener('DOMContentLoaded', onDomReady);

// Handle bfcache for general JS re-initializations
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Re-run specific initializations needed after bfcache restoration
        // Splash screen should not re-run if page was already loaded.
        // Page transitions listeners are typically fine.
        initScrollAnimations(); // Important to re-trigger animations
        initMobileNavActiveTab(); // Ensure correct tab is active
        // initFooterYear(); // Year won't change, not strictly necessary but harmless
    }
});