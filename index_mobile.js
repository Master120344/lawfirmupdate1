// --- Initial Page Load Loader Fade Out ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const bodyElement = document.body;

    // Set CSS variable for animation duration to match JS timeout
    // Ensure this duration is slightly less than or equal to the JS timeout for fade-out
    const loaderAnimationDuration = 1200; // ms, matches CSS --loader-transition-duration
    document.documentElement.style.setProperty('--loader-transition-duration', `${loaderAnimationDuration / 1000}s`);


    if (bodyElement) {
        bodyElement.classList.add('loaded'); // Start body fade-in
    } else {
        console.error("Body element not found on load.");
    }

    if (loader) {
        // Wait for loading bar animation to mostly complete, then fade out loader
        setTimeout(() => {
            loader.classList.add('hidden');
        }, loaderAnimationDuration + 300); // Total time: bar animation + short buffer for fade
    } else {
        console.error("Loader element not found on load.");
    }
});

// --- Handle Loader on Back/Forward Navigation (bfcache) ---
window.addEventListener('pageshow', (event) => {
    const loader = document.getElementById('loader');
    const bodyElement = document.body;

    if (event.persisted && loader) {
        loader.classList.add('hidden');
        if (bodyElement) {
            bodyElement.classList.add('loaded');
        }
        // If the loading bar animation was tied to a class, reset it here if needed
        // For this CSS animation, it will restart automatically if loader is reshown
    }
});


// --- Page Transition Loader ---
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');

    const internalLinks = document.querySelectorAll(
        'a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([target="_blank"])'
    );

    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const destination = link.getAttribute('href');
            const currentHostname = window.location.hostname;
            let destinationHostname;
            try {
                destinationHostname = new URL(destination, window.location.href).hostname;
            } catch (error) {
                console.warn("Invalid URL for link:", destination);
                return;
            }

            if (destinationHostname !== currentHostname) {
                return;
            }

            const currentPagePath = window.location.pathname.replace(/\/$/, "");
            const destinationPathObject = new URL(destination, window.location.href);
            const destinationPath = destinationPathObject.pathname.replace(/\/$/, "");

            if (destinationPath === currentPagePath && destinationPathObject.hash) {
                 return;
            }
             if (destinationPath === currentPagePath && !destinationPathObject.hash) {
                 e.preventDefault();
                 return;
             }

            e.preventDefault();

            if (loader) {
                // Reset loading bar animation if needed by removing and re-adding a class,
                // or ensure the CSS animation reruns correctly when 'hidden' is removed.
                // For this setup, removing 'hidden' should allow the animation to play again.
                loader.classList.remove('hidden');
            } else {
                console.error("Loader element not found for page transition.");
            }

            const pageTransitionLoaderDuration = 1200; // ms, should match CSS animation
            setTimeout(() => {
                window.location.href = destination;
            }, pageTransitionLoaderDuration + 100); // Navigate after bar animation + small buffer
        });
    });
});