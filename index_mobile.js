document.addEventListener('DOMContentLoaded', () => {
    const pageLoader = document.getElementById('page-loader');
    const loaderBar = document.getElementById('loader-bar');
    const navLinks = document.querySelectorAll('a.nav-link'); // Select only navigation links
    const currentPath = window.location.pathname.split('/').pop() || 'index_mobile.html'; // Get current page name

    const LOADER_DURATION_MIN = 3000; // 3 seconds
    const LOADER_DURATION_MAX = 5000; // 5 seconds

    // Function to show the loader
    function showLoader(callback) {
        if (!pageLoader || !loaderBar) {
            if (callback) callback(); // Proceed if loader elements aren't found
            return;
        }

        pageLoader.classList.add('visible');
        loaderBar.style.width = '0%';
        let progress = 0;
        const loadingDuration = Math.random() * (LOADER_DURATION_MAX - LOADER_DURATION_MIN) + LOADER_DURATION_MIN;
        const intervalTime = 50; // Update bar every 50ms
        const totalSteps = loadingDuration / intervalTime;
        const increment = 100 / totalSteps;

        const progressInterval = setInterval(() => {
            progress += increment;
            if (progress <= 100) {
                loaderBar.style.width = progress + '%';
            } else {
                loaderBar.style.width = '100%';
            }
        }, intervalTime);

        setTimeout(() => {
            clearInterval(progressInterval);
            loaderBar.style.width = '100%'; // Ensure it hits 100%
            if (callback) {
                // Slight delay to ensure 100% bar is seen before navigating or hiding
                setTimeout(callback, 150);
            }
        }, loadingDuration);
    }

    // Function to hide the loader (not typically called directly if navigating)
    function hideLoader() {
        if (!pageLoader) return;
        pageLoader.classList.remove('visible');
        if (loaderBar) loaderBar.style.width = '0%'; // Reset for next time
    }

    // Add 'active' class to current page nav link
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        }

        // Intercept navigation for internal page links
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            const isExternal = href.startsWith('http://') || href.startsWith('https://');
            const isHashLink = href.startsWith('#');
            const targetPath = href.split('/').pop();

            // Don't use loader for external links, hash links, or if navigating to the same page
            if (isExternal || isHashLink || targetPath === currentPath) {
                return; // Allow default behavior
            }

            event.preventDefault(); // Stop direct navigation for internal links
            showLoader(() => {
                window.location.href = href; // Navigate after loader animation
            });
        });
    });


    // --- Google Reviews Display Logic ---
    // This function will try to load reviews if googleReviewsData is available
    function displayGoogleReviews() {
        const reviewsContainer = document.getElementById('google-reviews-display-area');
        if (!reviewsContainer) return;

        // Check if googleReviewsData is defined (it should be by google_reviews.js)
        if (typeof googleReviewsData !== 'undefined' && googleReviewsData.length > 0) {
            reviewsContainer.innerHTML = ''; // Clear placeholder or old reviews

            googleReviewsData.forEach(review => {
                const reviewCard = document.createElement('div');
                reviewCard.classList.add('review-card');

                let starsHTML = '';
                for (let i = 1; i <= 5; i++) {
                    starsHTML += `<i class="${i <= review.rating ? 'fas' : 'far'} fa-star"></i>`;
                }

                reviewCard.innerHTML = `
                    <div class="author-info">
                        ${review.profile_photo_url ? `<img src="${review.profile_photo_url}" alt="${review.author_name}" class="author-photo">` : ''}
                        <span class="author-name">${review.author_name}</span>
                    </div>
                    <div class="rating">${starsHTML}</div>
                    ${review.relative_time_description ? `<div class="review-time">${review.relative_time_description}</div>` : ''}
                    <p class="review-text">${review.text}</p>
                `;
                reviewsContainer.appendChild(reviewCard);
            });
        } else {
            // Keep placeholder or show a specific message if data is not loaded
            // The static placeholder is already in HTML, so we might just update the "loading..." message
            const loadingMessage = reviewsContainer.querySelector('.loading-reviews-message');
            if (loadingMessage) {
                loadingMessage.textContent = 'No reviews available at the moment, or an error occurred.';
            }
             // If you want to remove static placeholders if no dynamic data:
            // const staticPlaceholders = reviewsContainer.querySelectorAll('.review-item-placeholder');
            // staticPlaceholders.forEach(ph => ph.style.display = 'none');
        }
    }

    // Call displayGoogleReviews once the DOM is ready and google_reviews.js *should* have loaded
    // The `defer` attribute on the script tags helps manage loading order.
    // We can also add a small timeout to ensure google_reviews.js has a chance to define its data.
    setTimeout(displayGoogleReviews, 100);


    // Handle back/forward browser navigation to hide loader if it gets stuck
    window.addEventListener('pageshow', function(event) {
        // event.persisted is true if page is from bfcache (back/forward cache)
        if (event.persisted && pageLoader) {
            hideLoader();
        }
    });

    // Initial check: If loader was somehow made visible by mistake on first load, hide it.
    // (CSS should handle initial hidden state, but this is a safeguard)
    if (pageLoader && pageLoader.classList.contains('visible')) {
         setTimeout(hideLoader, 50); // Ensure it doesn't flash
    }

}); // End DOMContentLoaded