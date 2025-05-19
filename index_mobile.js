// --- Initial Page Load Loader Fade Out ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const bodyElement = document.body;
    const LOADER_DURATION_MS = 4000; // Target 4 seconds

    document.documentElement.style.setProperty('--loader-display-duration', `${LOADER_DURATION_MS / 1000}s`);

    if (bodyElement) {
        bodyElement.classList.add('loaded');
    }

    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, LOADER_DURATION_MS + 200); // Loader hides after its animation + buffer
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
    }
});

// --- Page Transition Loader & Other DOM Ready Scripts ---
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const LOADER_DURATION_MS_TRANSITION = 4000; // Same duration for transitions

    // Page Transition Links
    const internalLinks = document.querySelectorAll(
        'a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([target="_blank"])'
    );
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // ... (existing link click logic remains the same)
            const destination = link.getAttribute('href');
            const currentHostname = window.location.hostname;
            let destinationHostname;
            try {
                destinationHostname = new URL(destination, window.location.href).hostname;
            } catch (error) { return; }

            if (destinationHostname !== currentHostname) { return; }

            const currentPagePath = window.location.pathname.replace(/\/$/, "");
            const destinationPathObject = new URL(destination, window.location.href);
            const destinationPath = destinationPathObject.pathname.replace(/\/$/, "");

            if (destinationPath === currentPagePath && destinationPathObject.hash) { return; }
            if (destinationPath === currentPagePath && !destinationPathObject.hash) { e.preventDefault(); return; }

            e.preventDefault();
            if (loader) {
                // Reset loading bar animation by removing and re-adding class if it doesn't restart
                // This approach is simple: just show the loader, CSS handles animation restart.
                loader.classList.remove('hidden');
            }
            setTimeout(() => {
                window.location.href = destination;
            }, LOADER_DURATION_MS_TRANSITION); // Navigate after loader animation
        });
    });

    // --- Testimonial Carousel ---
    const testimonialCarousel = document.querySelector('.testimonial-carousel');
    if (testimonialCarousel) {
        const testimonials = testimonialCarousel.querySelectorAll('.testimonial-item');
        let currentIndex = 0;
        const TESTIMONIAL_INTERVAL = 10000; // 10 seconds

        function showTestimonial(index) {
            testimonials.forEach((testimonial, i) => {
                if (i === index) {
                    testimonial.classList.add('active-testimonial');
                } else {
                    testimonial.classList.remove('active-testimonial');
                }
            });
        }

        if (testimonials.length > 0) {
            showTestimonial(currentIndex); // Show the first one immediately

            if (testimonials.length > 1) { // Only start interval if more than one testimonial
                setInterval(() => {
                    currentIndex = (currentIndex + 1) % testimonials.length;
                    showTestimonial(currentIndex);
                }, TESTIMONIAL_INTERVAL);
            }
        }
    }

    // --- Set Current Year in Footer ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});