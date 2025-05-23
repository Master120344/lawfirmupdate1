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
                    
                    if (currentPath === targetPath && !href.includes('#')) {
                         if ( (currentPath === '' || currentPath === 'index_desktop.html') && targetPath === 'index_desktop.html' && !href.includes('#')){
                            // Allow if current is root or index_desktop.html and target is index_desktop.html
                        } else {
                            e.preventDefault(); 
                            return; 
                        }
                    }
                    
                    if (!href.startsWith('#')) {
                        e.preventDefault();
                        pageTransitionLoader.classList.remove('hidden');
                        setTimeout(() => {
                            window.location.href = href;
                        }, 250);
                    }
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

// Renamed from initMobileNavActiveTab to reflect its usage for bottom tabs on desktop
function initBottomTabsActiveState() {
    const bottomTabs = document.querySelectorAll('.bottom-tabs-nav .tab-item'); // Updated selector
    let currentPage = window.location.pathname.split('/').pop();
    
    // Handle root path for index_desktop.html
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
        // Special case for root "Home" link if current page is the root index
        if ((currentPage === 'index_desktop.html' || currentPage === '') && tabTarget === 'index_desktop.html') {
            if (!tab.classList.contains('active')) { // Avoid adding class twice if already matched
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
    initBottomTabsActiveState(); // Updated function call
}

document.addEventListener('DOMContentLoaded', onDomReady);

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        initScrollAnimations();
        initBottomTabsActiveState(); // Updated function call
        
        const pageTransitionLoader = document.getElementById('page-transition-loader');
        if (pageTransitionLoader) {
            pageTransitionLoader.classList.add('hidden');
        }
    }
});
