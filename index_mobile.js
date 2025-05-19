// --- Initial Page Load Loader Fade Out ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const bodyElement = document.body;

    if (bodyElement) {
        bodyElement.classList.add('loaded');
    } else {
        console.error("Body element not found on load.");
    }

    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 400); // Slightly shorter delay, CSS transition handles smoothness
    } else {
        console.error("Loader element not found on load.");
    }
});

// --- Handle Loader on Back/Forward Navigation (bfcache) ---
window.addEventListener('pageshow', (event) => {
    const loader = document.getElementById('loader');
    const bodyElement = document.body;

    if (event.persisted && loader) {
        // Page is being restored from the bfcache
        // Instantly hide loader and ensure body is visible
        loader.classList.add('hidden');
        if (bodyElement) {
            bodyElement.classList.add('loaded'); // Ensure body is faded in
        }
        console.log("Page restored from bfcache, loader hidden.");
    }
    // For non-bfcache loads, the 'load' event will handle it or it's a new navigation.
});


// --- Page Transition Loader ---
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');

    const internalLinks = document.querySelectorAll(
        'a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([target="_blank"])'
    );
    // Further refine to exclude links that don't actually navigate away from the domain,
    // or ensure the href is a relative path or same-origin absolute path.
    // For simplicity, this selector is kept, but for complex sites, it might need more care.

    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const destination = link.getAttribute('href');
            const currentHostname = window.location.hostname;
            let destinationHostname;
            try {
                destinationHostname = new URL(destination, window.location.href).hostname;
            } catch (error) {
                // Invalid URL, likely a malformed href, let browser handle or ignore
                console.warn("Invalid URL for link:", destination);
                return;
            }

            // Only trigger for same-origin navigations
            if (destinationHostname !== currentHostname) {
                return; // Let external links navigate normally
            }

            const currentPagePath = window.location.pathname.replace(/\/$/, ""); // Normalize by removing trailing slash
            const destinationPathObject = new URL(destination, window.location.href);
            const destinationPath = destinationPathObject.pathname.replace(/\/$/, ""); // Normalize

            // If linking to the exact same page (e.g. index_mobile.html to index_mobile.html) or an anchor on the same page
            if (destinationPath === currentPagePath && destinationPathObject.hash) {
                 // Allow smooth scroll for on-page anchors
                 return;
            }
             if (destinationPath === currentPagePath && !destinationPathObject.hash) {
                 // Re-clicking the current page link - do nothing or perhaps a gentle visual cue
                 e.preventDefault(); // Prevent reload if desired
                 console.log("Link to current page clicked, no transition.");
                 return;
             }


            // Prevent default navigation to show loader
            e.preventDefault();

            if (loader) {
                loader.classList.remove('hidden'); // Show loader
                // Styles for loader are primarily handled by CSS, 'hidden' class toggles opacity/visibility
            } else {
                console.error("Loader element not found for page transition.");
            }

            // Navigate after a short delay for loader to appear
            setTimeout(() => {
                window.location.href = destination;
            }, 300); // Adjust delay as needed for visual balance
        });
    });
});