// --- Constants for Loader Durations ---
const INITIAL_LOADER_DURATION_MS = 1500; // Faster initial load: 1.5 seconds
const PAGE_TRANSITION_LOADER_DURATION_MS = 1000; // Faster page transitions: 1 second

// --- Initial Page Load Loader ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const bodyElement = document.body;

    // Set CSS variable for loading bar animation duration
    document.documentElement.style.setProperty('--loader-display-duration', `${INITIAL_LOADER_DURATION_MS / 1000}s`);

    if (bodyElement) {
        bodyElement.classList.add('loaded'); // Start body fade-in
    }

    if (loader) {
        // Hide loader after its animation duration + a small buffer
        setTimeout(() => {
            loader.classList.add('hidden');
        }, INITIAL_LOADER_DURATION_MS + 200);
    }
});

// --- Handle Loader on Back/Forward Navigation (bfcache) ---
window.addEventListener('pageshow', (event) => {
    const loader = document.getElementById('loader');
    const bodyElement = document.body;
    if (event.persisted && loader) { // If page is from bfcache
        loader.classList.add('hidden'); // Ensure loader is hidden immediately
        if (bodyElement) {
            bodyElement.classList.add('loaded'); // Ensure body is visible
        }
    }
});

// --- DOM Ready Scripts (Internal Links, Google Reviews etc.) ---
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');

    // Page Transition Links
    const internalLinks = document.querySelectorAll(
        'a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([target="_blank"])'
    );
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const destination = link.getAttribute('href');
            // Basic check if it's an internal link to a different page
            if (!destination || destination.startsWith('#') || destination.startsWith('tel:') || destination.startsWith('mailto:') || destination.startsWith('javascript:') || link.target === '_blank') {
                return;
            }
            // Check if it's truly a different page and not just a hash on the current page
            const currentPath = window.location.pathname.replace(/\/$/, "");
            const destinationUrl = new URL(destination, window.location.href);
            const destinationPath = destinationUrl.pathname.replace(/\/$/, "");

            if (destinationUrl.hostname !== window.location.hostname) return; // External link
            if (destinationPath === currentPath && destinationUrl.hash) return; // Link to hash on same page
            if (destinationPath === currentPath && !destinationUrl.hash) { e.preventDefault(); return; } // Link to same page without hash

            e.preventDefault();
            if (loader) {
                document.documentElement.style.setProperty('--loader-display-duration', `${PAGE_TRANSITION_LOADER_DURATION_MS / 1000}s`);
                const loadingBarProgress = loader.querySelector('.loading-bar-progress');
                if (loadingBarProgress) { // Reset animation
                    loadingBarProgress.style.animation = 'none';
                    void loadingBarProgress.offsetWidth; // Trigger reflow
                    loadingBarProgress.style.animation = '';
                }
                loader.classList.remove('hidden');
            }
            setTimeout(() => {
                window.location.href = destination;
            }, PAGE_TRANSITION_LOADER_DURATION_MS);
        });
    });

    // Fetch and display Google Reviews
    fetchGoogleReviews();

    // --- Set Current Year in Footer (If you add a footer with id="current-year") ---
    // const yearSpan = document.getElementById('current-year');
    // if (yearSpan) {
    //     yearSpan.textContent = new Date().getFullYear();
    // }
});


// --- Google Reviews Functions ---
async function fetchGoogleReviews() {
    const apiKey = 'YOUR_GOOGLE_PLACES_API_KEY'; // !!! REPLACE WITH YOUR ACTUAL GOOGLE PLACES API KEY !!!
    const placeId = 'ChIJ9xY_xH9MW4YRAdx_LNoS8mU'; // The Kershaw Law Firm, P.C., Austin, TX
    const reviewsContainer = document.getElementById('google-reviews-container');
    const googleReviewsMainLink = document.getElementById('google-reviews-main-link');

    if (!reviewsContainer) return;

    if (apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
        reviewsContainer.innerHTML = '<p class="error-reviews-text">Google Reviews API Key is not configured. Please set it in index_mobile.js.</p>';
        return;
    }

    // Update the main "Read Google Reviews" button link
    if (googleReviewsMainLink) {
         // A more generic link to search results, as direct reviews links can be complex
        googleReviewsMainLink.href = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`;
    }


    // Using a CORS proxy for client-side requests to Google Places API
    // For production, consider a server-side proxy or a more robust free/paid proxy.
    // const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // May require visiting to activate
    const proxyUrl = 'https://api.allorigins.win/get?url='; // Alternative proxy

    const fields = 'name,rating,reviews,user_ratings_total,url,website';
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&fields=${fields}&key=${apiKey}&language=en&reviews_sort=newest`;

    // Construct the final URL for the proxy
    const requestUrl = `${proxyUrl}${encodeURIComponent(googleApiUrl)}`;


    try {
        const response = await fetch(requestUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // allorigins.win wraps the actual response in a 'contents' property
        const placeData = JSON.parse(data.contents);


        if (placeData.status === "OK" && placeData.result && placeData.result.reviews && placeData.result.reviews.length > 0) {
            reviewsContainer.innerHTML = ''; // Clear "Loading..."
            // Sort reviews by time (newest first) if not already sorted by API
            const sortedReviews = placeData.result.reviews.sort((a, b) => b.time - a.time);

            sortedReviews.slice(0, 5).forEach(review => { // Display up to 5 reviews
                const reviewCard = createReviewCard(review);
                reviewsContainer.appendChild(reviewCard);
            });
        } else if (placeData.status === "OK" && (!placeData.result.reviews || placeData.result.reviews.length === 0)) {
            reviewsContainer.innerHTML = '<p class="no-reviews-text">No reviews found for this location yet.</p>';
        } else {
            console.error('Google Places API Error:', placeData.error_message || placeData.status);
            reviewsContainer.innerHTML = `<p class="error-reviews-text">Could not load reviews. Status: ${placeData.status}${placeData.error_message ? ' - ' + placeData.error_message : ''}</p>`;
        }
    } catch (error) {
        console.error('Failed to fetch Google Reviews:', error);
        reviewsContainer.innerHTML = '<p class="error-reviews-text">An error occurred while trying to load reviews. Please check the console for details.</p>';
        if (error.message.includes("CORS") || error.message.includes("NetworkError")) {
             reviewsContainer.innerHTML += '<p class="error-reviews-text" style="font-size: 0.8em;">This might be a CORS issue. Ensure the proxy is working or consider a server-side solution.</p>';
        }
    }
}

function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';

    const header = document.createElement('div');
    header.className = 'review-header';

    const img = document.createElement('img');
    img.className = 'reviewer-photo';
    // Google review.profile_photo_url often needs proxying too or might be restricted.
    // Using a placeholder for simplicity, can be enhanced.
    img.src = review.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name)}&background=003366&color=fff&size=50`;
    img.alt = review.author_name;

    const reviewerInfoDiv = document.createElement('div');
    reviewerInfoDiv.className = 'reviewer-info';

    const name = document.createElement('h4');
    name.textContent = review.author_name;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'review-meta';

    const ratingSpan = document.createElement('span');
    ratingSpan.className = 'review-rating';
    ratingSpan.innerHTML = getStarRatingHTML(review.rating);

    const timeP = document.createElement('p');
    timeP.className = 'review-time';
    timeP.textContent = review.relative_time_description;

    metaDiv.appendChild(ratingSpan);
    metaDiv.appendChild(timeP);
    reviewerInfoDiv.appendChild(name);
    reviewerInfoDiv.appendChild(metaDiv);
    header.appendChild(img);
    header.appendChild(reviewerInfoDiv);

    const textP = document.createElement('p');
    textP.className = 'review-text';
    const fullText = review.text;
    const shortTextLength = 150; // Characters to show before "Read more"

    if (fullText.length > shortTextLength) {
        const shortText = fullText.substring(0, shortTextLength);
        textP.innerHTML = `${shortText.replace(/\n/g, '<br>')}<span class="read-more-dots">... </span><span class="read-more-less">Read more</span>`;
        const readMoreSpan = textP.querySelector('.read-more-less');
        const dotsSpan = textP.querySelector('.read-more-dots');

        readMoreSpan.addEventListener('click', () => {
            if (readMoreSpan.textContent === 'Read more') {
                textP.innerHTML = `${fullText.replace(/\n/g, '<br>')} <span class="read-more-less">Read less</span>`;
                dotsSpan.style.display = 'none';
                textP.querySelector('.read-more-less').addEventListener('click', arguments.callee); // Re-attach event
            } else {
                textP.innerHTML = `${shortText.replace(/\n/g, '<br>')}<span class="read-more-dots">... </span><span class="read-more-less">Read more</span>`;
                textP.querySelector('.read-more-less').addEventListener('click', arguments.callee); // Re-attach event
            }
        });
    } else {
        textP.innerHTML = fullText.replace(/\n/g, '<br>');
    }

    card.appendChild(header);
    card.appendChild(textP);
    return card;
}

function getStarRatingHTML(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const halfStar = (rating % 1) >= 0.4 && (rating % 1) <= 0.6; // Google's half is often just a full star if > .5
    const hasDecimal = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasDecimal) { // Handle decimal ratings
             if (rating % 1 >= 0.7) { // Treat .7 and above as full star
                starsHTML += '<i class="fas fa-star"></i>';
            } else if (rating % 1 >= 0.3) { // Treat .3 to .6 as half star
                starsHTML += '<i class="fas fa-star-half-alt"></i>';
            } else { // Below .3 treat as empty for this star
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
        else {
            starsHTML += '<i class="far fa-star"></i>'; // Empty star
        }
    }
    return starsHTML || 'No rating';
}