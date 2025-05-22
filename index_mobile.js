document.addEventListener('DOMContentLoaded', () => {
    // --- Splash Screen Logic ---
    const splashLoader = document.getElementById('splash-loader');
    const mainContent = document.getElementById('main-content');
    const siteHeader = document.getElementById('site-header');

    if (splashLoader) {
        splashLoader.classList.remove('hidden'); // Ensure it's visible if JS is running

        // Hide main content and header initially if splash is active
        if (mainContent) mainContent.style.visibility = 'hidden';
        if (siteHeader) siteHeader.style.transform = 'translateY(-100%)';


        let loaderDuration = 2500; // Default 2.5 seconds
        const loaderDurationCSS = getComputedStyle(document.documentElement).getPropertyValue('--loader-display-duration').trim();
        if (loaderDurationCSS) {
            const parsedSeconds = parseFloat(loaderDurationCSS.replace('s', ''));
            if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
                loaderDuration = parsedSeconds * 1000;
            }
        }
        
        const loadingBarProgress = splashLoader.querySelector('.loading-bar-progress');
        if(loadingBarProgress && loaderDurationCSS) { // Ensure loading bar matches CSS variable if present
             loadingBarProgress.style.animationDuration = loaderDurationCSS;
        }

        setTimeout(() => {
            splashLoader.classList.add('hidden');
            if (mainContent) {
                mainContent.style.visibility = 'visible'; // Make it part of the layout
                // Opacity transition is handled by CSS: .page-content-wrapper
            }
            if (siteHeader) {
                 siteHeader.style.transform = 'translateY(0)'; // Animate header in
            }
            document.body.classList.add('loaded'); // Allows CSS to fade in body and content
        }, loaderDuration);
    } else {
        // No splash loader, ensure content and header are visible and body is marked loaded
        if (mainContent) mainContent.style.visibility = 'visible';
        if (siteHeader) siteHeader.style.transform = 'translateY(0)';
        document.body.classList.add('loaded');
    }

    // --- Page Transition Loader (Show on link clicks, hide on page load) ---
    const pageTransitionLoader = document.getElementById('page-transition-loader');
    if (pageTransitionLoader) {
        const allInternalLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"]):not([target="_blank"])');
        allInternalLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                // Basic check to avoid showing for external links if any were missed by selector
                if (href && (href.startsWith('.') || href.startsWith('/') || !href.includes(':'))) {
                    e.preventDefault();
                    pageTransitionLoader.classList.remove('hidden');
                    setTimeout(() => {
                        window.location.href = href;
                    }, 250); // Small delay for loader to appear
                }
            });
        });

        // Hide page transition loader on page load (bfcache might keep it visible)
        window.addEventListener('pageshow', function(event) {
            // No matter if from bfcache or not, hide it.
            // It should only show during active navigation initiated by click.
            pageTransitionLoader.classList.add('hidden');
        });
    }


    // --- Animate on Scroll ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0 && "IntersectionObserver" in window) {
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
            // Add 'is-visible' directly if element is already in viewport on load
            // This can happen if it's very high on the page.
            // However, for a more consistent animation reveal, we let the observer handle it.
            // To ensure elements above the fold also animate, they should initially not have 'is-visible'.
            observer.observe(el);
        });
    } else {
        animatedElements.forEach(el => el.classList.add('is-visible')); // Fallback
    }

    // --- Current Year in Footer ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Active Tab in Mobile Navigation ---
    // This logic assumes that the href of the active tab matches the current page's filename.
    // e.g., on 'index_mobile.html', the tab with href 'index_mobile.html' will be active.
    const mobileTabs = document.querySelectorAll('.mobile-tabs .tab-item');
    const currentPage = window.location.pathname.split('/').pop(); // Gets 'index_mobile.html' or similar

    mobileTabs.forEach(tab => {
        const tabTarget = tab.getAttribute('href');
        tab.classList.remove('active'); // Remove active from all first
        tab.removeAttribute('aria-current');
        if (tabTarget === currentPage || (currentPage === '' && tabTarget === 'index_mobile.html')) {
            tab.classList.add('active');
            tab.setAttribute('aria-current', 'page');
        }
    });
});

// Handle bfcache for general JS re-initializations
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Re-run the DOMContentLoaded logic if the page is from bfcache.
        // This helps re-initialize scripts that depend on DOM state.
        const domContentLoadedEvent = new Event('DOMContentLoaded');
        document.dispatchEvent(domContentLoadedEvent);
    }
});