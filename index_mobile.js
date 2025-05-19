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
        }, 400); // Delay matches the CSS opacity transition duration
    } else {
        console.error("Loader element not found.");
    }
});

// --- Page Transition Loader ---
// This runs when the DOM is ready to attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');

    // Select all internal links that navigate to a different page
    // This selects <a> tags with an href that don't start with # (anchor),
    // tel:, mailto:, javascript:, or http/https (external links)
    const internalLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([href^="http"]):not([href^="https"])');

    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Get the destination URL from the link's href
            const destination = link.getAttribute('href');

            // Check if the destination is different from the current page
            // This prevents the loader from showing if clicking the link
            // to the page you're already on. You might adjust this logic
            // depending on how strict you want it (e.g., handling index.html vs /)
             const currentPage = window.location.pathname.split('/').pop(); // Get current file name
             const destinationPage = destination.split('/').pop(); // Get destination file name

             if (destinationPage === currentPage || destination === '#') {
                 // If linking to the current page or an anchor on the current page,
                 // let the default behavior happen (or handle smooth scroll for #)
                 return;
             }


            // Prevent the default navigation
            e.preventDefault();

            // Show the loader overlay immediately
            if (loader) {
                 loader.classList.remove('hidden');

                 // --- Ensure loader styling for transition ---
                 // Remove any residual centering/initial styles
                 loader.style.position = 'fixed';
                 loader.style.top = '0';
                 loader.style.left = '0';
                 loader.style.transform = 'none';
                 loader.style.width = '100%';
                 loader.style.height = '100%';
                 loader.style.background = 'rgba(255, 255, 255, 0.9)'; // Ensure overlay background
                 loader.style.display = 'flex'; // Ensure flex display for centering spinner
            }

            // Wait a brief moment (e.g., 300ms) for the loader animation
            // or overlay to become clearly visible before navigating.
            // Adjust this timeout based on how long you want the visual transition effect.
            setTimeout(() => {
                // Navigate to the destination URL
                window.location.href = destination;
            }, 300); // 300ms delay before navigation
        });
    });

    // --- Removed Firebase Authentication Code ---
    // All Firebase-related functions, imports, and event listeners are removed
    // from this file as per the user's request.
});