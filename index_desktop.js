document.addEventListener('DOMContentLoaded', () => {
    // --- Splash Screen Logic ---
    const splashLoader = document.getElementById('splash-loader');
    const mainContentForSplash = document.getElementById('main-content'); // Or body
    const siteHeaderForSplash = document.getElementById('site-header');

    if (splashLoader) {
        // Ensure it's visible initially if not already by CSS
        splashLoader.classList.remove('hidden');
        if (mainContentForSplash) mainContentForSplash.style.visibility = 'hidden';
        if (siteHeaderForSplash) siteHeaderForSplash.style.transform = 'translateY(-100%)'; // Hide header initially


        // Determine loader duration from CSS variable or set a default
        let loaderDuration = 3000; // Default 3 seconds
        const loaderDurationCSS = getComputedStyle(document.documentElement).getPropertyValue('--loader-display-duration');
        if (loaderDurationCSS) {
            const parsedDuration = parseFloat(loaderDurationCSS) * 1000;
            if (!isNaN(parsedDuration)) {
                loaderDuration = parsedDuration;
            }
        }
        
        // If there's a loading bar, its animation should ideally match this duration
        const loadingBarProgress = splashLoader.querySelector('.loading-bar-progress');
        if(loadingBarProgress) {
             loadingBarProgress.style.animationDuration = (loaderDuration / 1000) + 's';
        }


        setTimeout(() => {
            splashLoader.classList.add('hidden');
            if (mainContentForSplash) {
                mainContentForSplash.style.visibility = 'visible';
                mainContentForSplash.style.opacity = '0'; // Start fade in
                setTimeout(() => mainContentForSplash.style.opacity = '1', 50); // Trigger fade in
            }
            if (siteHeaderForSplash) {
                 siteHeaderForSplash.style.transform = 'translateY(0)';
            }
            document.body.classList.add('loaded'); // For general body fade-in if CSS uses it
        }, loaderDuration);
    } else {
        // No splash loader, make sure content is visible
        if (mainContentForSplash) {
            mainContentForSplash.style.visibility = 'visible';
            mainContentForSplash.style.opacity = '1';
        }
         if (siteHeaderForSplash) {
            siteHeaderForSplash.style.transform = 'translateY(0)';
        }
        document.body.classList.add('loaded');
    }

    // --- Page Transition Loader (Example, if used between pages) ---
    const pageTransitionLoader = document.getElementById('page-transition-loader');
    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');

            // Check if it's an internal link, not a new tab, and not a hash link
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && target !== '_blank') {
                // Check if it's navigating away from the current domain
                const isExternal = new URL(href, window.location.origin).origin !== window.location.origin;
                
                if (!isExternal && pageTransitionLoader) {
                    e.preventDefault();
                    pageTransitionLoader.classList.remove('hidden');
                    setTimeout(() => {
                        window.location.href = href;
                    }, 300); // Small delay for loader to appear
                }
            }
        });
    });
    
    // Hide page transition loader on page load (bfcache might keep it visible)
    if (pageTransitionLoader) {
      window.addEventListener('pageshow', function(event) {
        if (!event.persisted) { // Not from bfcache
          pageTransitionLoader.classList.add('hidden');
        } else { // From bfcache, ensure it's hidden quickly
          setTimeout(() => pageTransitionLoader.classList.add('hidden'), 0);
        }
      });
    }


    // --- Header Scroll Behavior ---
    const siteHeader = document.getElementById('site-header');
    let lastScrollTop = 0;
    const scrollThreshold = 10; // Pixels to scroll before reacting

    if (siteHeader) {
        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (Math.abs(scrollTop - lastScrollTop) > scrollThreshold) {
                if (scrollTop > lastScrollTop && scrollTop > siteHeader.offsetHeight) {
                    // Scroll Down
                    siteHeader.style.transform = `translateY(-${siteHeader.offsetHeight}px)`;
                    siteHeader.classList.remove('scrolled'); // Optional: remove scrolled class if hiding
                } else {
                    // Scroll Up
                    siteHeader.style.transform = 'translateY(0)';
                    if (scrollTop > 50) { // Add 'scrolled' class when not at the very top
                        siteHeader.classList.add('scrolled');
                    } else {
                        siteHeader.classList.remove('scrolled');
                    }
                }
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
            }
             // Ensure header is visible and not 'scrolled' if at the very top
            if (scrollTop <= 50) { // Use a small threshold for being "at the top"
                siteHeader.style.transform = 'translateY(0)';
                siteHeader.classList.remove('scrolled');
            }
        }, { passive: true });
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
                    observerInstance.unobserve(el); // Stop observing once visible
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    } else { // Fallback for older browsers or if no elements
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }

    // --- Current Year in Footer ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Active Nav Link highlighting based on URL (Simple Version) ---
    // (More robust solution would check sections in view for single-page apps)
    const desktopNavLinks = document.querySelectorAll('.desktop-navigation .nav-link');
    const currentPath = window.location.pathname.split("/").pop(); // Gets the current file name

    desktopNavLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split("/").pop();
        link.classList.remove('active'); // Remove active from all
        link.removeAttribute('aria-current');

        if (currentPath === linkPath || (currentPath === '' && linkPath === 'index_desktop.html')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

});

// Handle bfcache for JS initializations
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Re-run the DOMContentLoaded logic if the page is from bfcache.
        // This is a simple way to re-initialize.
        // For more complex scenarios, you might need a more targeted re-init function for each module.
        // console.log("Page loaded from bfcache, re-running DOMContentLoaded logic.");
        const domContentLoadedEvent = new Event('DOMContentLoaded');
        document.dispatchEvent(domContentLoadedEvent);
    }
});