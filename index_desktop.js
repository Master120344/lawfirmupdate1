// index_desktop.js

function initSplashAndContent() {
    const splashLoader = document.getElementById('splash-loader');
    const mainContent = document.getElementById('main-content');
    const siteHeader = document.getElementById('site-header');
    const body = document.body;

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
        
        const loadingBarProgress = splashLoader.querySelector('.loading-bar-progress'); // This element is not in index_desktop.html splash
        if (loadingBarProgress && loaderDurationCSS) { 
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
            if (link.dataset.pageTransitionAttached) return;

            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && (href.startsWith('.') || href.startsWith('/') || !href.includes(':'))) { // Basic check for internal/relative
                    const currentPath = window.location.pathname.split('/').pop();
                    const targetPath = href.split('/').pop().split('#')[0]; // Get target filename without hash
                    
                    // Prevent reload if already on the page (and no hash)
                    if (currentPath === targetPath && !href.includes('#')) {
                         // Special case: if current is root or index_desktop.html and target is index_desktop.html, allow only if it's a new navigation intent (not a redundant click on current page's link)
                         // This logic might need refinement based on exact desired behavior for same-page links.
                         // The original "if" was complex, simplified here to generally prevent same-page reloads without hash.
                         if ( (currentPath === '' && targetPath === 'index_desktop.html') || (currentPath === 'index_desktop.html' && targetPath === 'index_desktop.html') ){
                            // Allow for now, but consider if truly needed. Often better to just let browser handle.
                            // e.preventDefault(); return; // Potentially uncomment this to stop all same-page no-hash clicks
                        } else {
                            e.preventDefault(); 
                            return; 
                        }
                    }
                    
                    if (!href.startsWith('#')) { // Don't do transition for hash links
                        e.preventDefault();
                        pageTransitionLoader.classList.remove('hidden');
                        setTimeout(() => {
                            window.location.href = href;
                        }, 250); // Duration for transition
                    }
                }
            });
            link.dataset.pageTransitionAttached = 'true';
        });

        window.addEventListener('pageshow', function(event) { // Hide loader if user navigates back
            pageTransitionLoader.classList.add('hidden');
        });
    }
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0 && "IntersectionObserver" in window) {
        animatedElements.forEach(el => el.classList.remove('is-visible')); // Ensure they start hidden

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.dataset.animationDelay) || 0;
                    setTimeout(() => {
                        el.classList.add('is-visible');
                    }, delay);
                    observerInstance.unobserve(el); // Animate only once
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% visible

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    } else { // Fallback if IntersectionObserver is not supported
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }
}

function initFooterYear() {
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

function initBottomTabsActiveState() {
    const bottomTabs = document.querySelectorAll('.bottom-tabs-nav .tab-item');
    let currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === '' && (window.location.pathname === '/' || window.location.pathname.endsWith('/index_desktop.html') || window.location.pathname.endsWith('/'))) {
        currentPage = 'index_desktop.html';
    }

    bottomTabs.forEach(tab => {
        const tabTarget = tab.getAttribute('href').split('/').pop();
        tab.classList.remove('active');
        tab.removeAttribute('aria-current');

        if (tabTarget === currentPage) {
            tab.classList.add('active');
            tab.setAttribute('aria-current', 'page');
        }
        // Ensure "Home" tab is active on index_desktop.html even if path is just "/"
        if ((currentPage === 'index_desktop.html' || currentPage === '') && tabTarget === 'index_desktop.html') {
            if (!tab.classList.contains('active')) {
                 tab.classList.add('active');
                 tab.setAttribute('aria-current', 'page');
            }
        }
    });
}

function onDomReady() {
    initSplashAndContent();
    initPageTransitions();
    initScrollAnimations();
    initFooterYear();
    initBottomTabsActiveState();
}

document.addEventListener('DOMContentLoaded', onDomReady);

window.addEventListener('pageshow', (event) => { // Handle bfcache
    if (event.persisted) {
        initScrollAnimations(); // Re-run scroll animations
        initBottomTabsActiveState(); // Re-set active tab
        
        const pageTransitionLoader = document.getElementById('page-transition-loader');
        if (pageTransitionLoader) {
            pageTransitionLoader.classList.add('hidden'); // Ensure transition loader is hidden
        }
        // May need to re-initialize other dynamic content if it's affected by bfcache
    }
});
