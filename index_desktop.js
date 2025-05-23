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
        if (siteHeader) siteHeader.style.transform = 'translateY(-100%)'; // Keep initial hide

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
                // mainContent.style.opacity = '1'; // CSS handles this via .loaded on body
            }
            if (siteHeader) {
                 siteHeader.style.transform = 'translateY(0)'; // Show header
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
                    
                    // Updated for desktop: index_desktop.html
                    if (currentPath === targetPath && !href.includes('#')) {
                         if ( (currentPath === '' || currentPath === 'index_desktop.html') && targetPath === 'index_desktop.html' && !href.includes('#')){
                            // Allow if current is root or index_desktop.html and target is index_desktop.html
                        } else {
                            e.preventDefault(); 
                            return; 
                        }
                    }
                    
                    // Prevent default navigation only if it's not a hash link on the same page
                    if (!href.startsWith('#')) {
                        e.preventDefault();
                        pageTransitionLoader.classList.remove('hidden');
                        setTimeout(() => {
                            window.location.href = href;
                        }, 250); // Duration for loader visibility before navigation
                    }
                }
            });
            link.dataset.pageTransitionAttached = 'true';
        });

        window.addEventListener('pageshow', function(event) {
            // Hide transition loader if user navigates back/forward
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
        animatedElements.forEach(el => el.classList.add('is-visible')); // Fallback for older browsers
    }
}

function initFooterYear() {
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

function initDesktopNavActiveTab() {
    const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-link'); // Updated selector
    let currentPage = window.location.pathname.split('/').pop();

    // Handle root path for index_desktop.html
    if (currentPage === '' && (window.location.pathname === '/' || window.location.pathname.endsWith('/index_desktop.html'))) {
        currentPage = 'index_desktop.html';
    } else if (currentPage === '' && !window.location.pathname.endsWith('/')) {
         // Handles cases like example.com/folder -> implies index file in folder
         // For simplicity, if it's a directory, and index_desktop.html is the default, this logic might need refinement
         // or server-side rewrite to ensure currentPage becomes 'index_desktop.html'
         // For now, we assume direct file names or root as 'index_desktop.html'
    }


    desktopNavLinks.forEach(link => {
        const linkTarget = link.getAttribute('href').split('/').pop();
        link.classList.remove('active');
        link.removeAttribute('aria-current');

        if (linkTarget === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
        // Special case for root "Home" link if current page is the root index
        if ((currentPage === 'index_desktop.html' || currentPage === '') && linkTarget === 'index_desktop.html') {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

function onDomReady() {
    initSplashAndContent();
    initPageTransitions();
    initScrollAnimations();
    initFooterYear();
    initDesktopNavActiveTab(); // Updated function call
}

document.addEventListener('DOMContentLoaded', onDomReady);

window.addEventListener('pageshow', (event) => {
    if (event.persisted) { // From bfcache
        // Splash screen is handled by its own logic (doesn't re-run if body.loaded)
        initScrollAnimations(); // Re-trigger animations as elements might be in viewport
        initDesktopNavActiveTab(); // Ensure correct nav item is active
        // initFooterYear(); // Not strictly necessary, year usually doesn't change in a session
        
        // Re-hide page transition loader if it was somehow stuck
        const pageTransitionLoader = document.getElementById('page-transition-loader');
        if (pageTransitionLoader) {
            pageTransitionLoader.classList.add('hidden');
        }
    }
});
