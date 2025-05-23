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
        if (siteHeader) {
            // Get header height from CSS variable to correctly hide it initially
            const headerHeight = getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim() || '80px';
            siteHeader.style.transform = `translateY(-${headerHeight})`;
        }


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
            if (link.dataset.pageTransitionAttached) return;

            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && (href.startsWith('.') || href.startsWith('/') || !href.includes(':'))) {
                    const currentPath = window.location.pathname.split('/').pop();
                    const targetPath = href.split('/').pop().split('#')[0];
                    
                    // Handle case where currentPath might be empty (root) and target is index_desktop.html
                    const isCurrentRootAndTargetIndex = (currentPath === '' || currentPath === '/') && targetPath === 'index_desktop.html';
                    const isCurrentIndexAndTargetIndex = currentPath === 'index_desktop.html' && targetPath === 'index_desktop.html';

                    if ((isCurrentIndexAndTargetIndex || isCurrentRootAndTargetIndex) && !href.includes('#')) {
                         e.preventDefault(); 
                         return; 
                    }
                    if (currentPath === targetPath && !href.includes('#') && !isCurrentRootAndTargetIndex) {
                        e.preventDefault();
                        return;
                    }


                    e.preventDefault();
                    pageTransitionLoader.classList.remove('hidden');
                    setTimeout(() => {
                        window.location.href = href;
                    }, 250); // Duration for the loader to show
                }
            });
            link.dataset.pageTransitionAttached = 'true';
        });

        window.addEventListener('pageshow', function(event) {
            pageTransitionLoader.classList.add('hidden');
        });
    }
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0 && "IntersectionObserver" in window) {
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

function initDesktopNavActiveTab() {
    const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-link');
    let currentPage = window.location.pathname.split('/').pop();

    // If on root path (e.g. "www.example.com/"), consider it 'index_desktop.html'
    if (currentPage === '' && (window.location.pathname === '/' || window.location.pathname.endsWith('/'))) {
        currentPage = 'index_desktop.html';
    }
    
    desktopNavLinks.forEach(link => {
        const linkTarget = link.getAttribute('href').split('/').pop();
        link.classList.remove('active');
        link.removeAttribute('aria-current');

        if (linkTarget === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}


// Main DOMContentLoaded Function
function onDomReady() {
    initSplashAndContent();
    initPageTransitions();
    initScrollAnimations();
    initFooterYear();
    initDesktopNavActiveTab(); // Use desktop navigation handler
}

document.addEventListener('DOMContentLoaded', onDomReady);

// Handle bfcache
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        initScrollAnimations();
        initDesktopNavActiveTab(); // Use desktop navigation handler
        // initFooterYear(); // Not strictly necessary but harmless
        // The splash screen should not re-run if body.loaded is true, handled in initSplashAndContent
    }
});
