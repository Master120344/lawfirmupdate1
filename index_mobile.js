// --- Initial Page Load Loader Fade Out ---
// This runs when the initial page load is complete
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const bodyElement = document.body;

    // Add 'loaded' class to body to trigger fade-in defined in CSS
    if (bodyElement) {
        bodyElement.classList.add('loaded');
    } else {
        console.error("Body element not found.");
    }

    // Fade out and hide the loader after a short delay
    if (loader) {
        // Add the 'hidden' class to trigger the CSS fade-out transition
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500); // Increased delay slightly to match enhanced visuals
    } else {
        console.error("Loader element not found.");
    }
});

// --- Page Transition Loader ---
// This runs when the DOM is ready to attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');

    // Select all internal links that navigate to a different page
    const internalLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([href^="http"]):not([href^="https"]):not([target="_blank"])'); // Exclude target="_blank" links

    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const destination = link.getAttribute('href');

            // Simple check if destination is potentially the current page
            // This check is basic and might need refinement depending on your URL structure
             const currentPagePath = window.location.pathname;
             const destinationPath = new URL(destination, window.location.href).pathname; // Resolve destination path relative to current page

             if (destinationPath === currentPagePath || destination === '#') {
                 // If linking to the current page or an anchor, do nothing (let default behavior happen)
                 return;
             }


            // Prevent the default navigation
            e.preventDefault();

            // Show the loader overlay immediately
            if (loader) {
                 loader.classList.remove('hidden');

                 // --- Ensure loader styling for transition ---
                 // Override any initial centering/load styles to be a full overlay
                 loader.style.position = 'fixed';
                 loader.style.top = '0';
                 loader.style.left = '0';
                 loader.style.transform = 'none';
                 loader.style.width = '100%';
                 loader.style.height = '100%';
                 loader.style.background = 'rgba(255, 255, 255, 0.95)'; // Match CSS overlay background
                 loader.style.display = 'flex'; // Ensure flex display for centering spinner
            }

            // Wait a brief moment for the loader animation to show, then navigate
            setTimeout(() => {
                window.location.href = destination;
            }, 350); // Slightly increased delay for visual effect
        });
    });

    // Firebase code remains removed.
});