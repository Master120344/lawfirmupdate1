// google_reviews.js

let autoPlayIntervalGoogleReviews; // Make interval ID accessible for clearing

function initializeGoogleReviewsCarousel() {
    const carouselWrapper = document.querySelector('.testimonial-carousel-wrapper');
    if (!carouselWrapper) {
        return;
    }

    // Clear any existing interval before re-initializing
    if (autoPlayIntervalGoogleReviews) {
        clearInterval(autoPlayIntervalGoogleReviews);
        autoPlayIntervalGoogleReviews = null;
    }

    const carousel = carouselWrapper.querySelector('.testimonial-carousel');
    const items = carousel ? carousel.querySelectorAll('.testimonial-item') : null;
    const prevButton = carouselWrapper.querySelector('.carousel-control.prev');
    const nextButton = carouselWrapper.querySelector('.carousel-control.next');
    const dotsContainer = carouselWrapper.querySelector('.carousel-dots');

    // Reset display states in case they were hidden by previous run
    if(prevButton) prevButton.style.display = ''; // Reset to CSS default
    if(nextButton) nextButton.style.display = ''; // Reset to CSS default
    if(dotsContainer) dotsContainer.style.display = ''; // Reset to CSS default
    if(carouselWrapper) carouselWrapper.style.display = ''; // Reset to CSS default


    if (!carousel || !items || items.length === 0 || !dotsContainer) {
        if(prevButton) prevButton.style.display = 'none';
        if(nextButton) nextButton.style.display = 'none';
        if(dotsContainer) dotsContainer.style.display = 'none';
        if (carouselWrapper && (!items || items.length === 0)) {
            carouselWrapper.style.display = 'none';
        }
        return;
    }

    if (items.length <= 1) {
        if(prevButton) prevButton.style.display = 'none';
        if(nextButton) nextButton.style.display = 'none';
        if(dotsContainer) dotsContainer.style.display = 'none';
    }

    let currentIndex = 0;
    const totalItems = items.length;
    const autoPlayDelay = 7000;

    // Remove old event listeners if any, before adding new ones (for re-initialization)
    // This is a bit more involved, simplest way is to clone and replace if listeners become an issue
    // For now, we assume the original script didn't have issues with multiple listener attachments
    // or that the specific listeners (mouseenter, focusin etc) are fine if added again.
    // A more robust way would be to use named functions for listeners and remove them.
    // Or, only add listeners if a flag indicates they haven't been added.

    function updateCarousel() {
        if (carousel) {
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
        updateDots();
    }

    function updateDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = ''; // Clear existing dots
        if (totalItems <= 1) return;

        for (let i = 0; i < totalItems; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === currentIndex) {
                dot.classList.add('active');
            }
            dot.setAttribute('aria-label', `Go to review ${i + 1}`);
            // Attach event listener for dot click
            dot.removeEventListener('click', handleDotClick); // Remove if already attached
            dot.addEventListener('click', handleDotClick);
            dotsContainer.appendChild(dot);
        }
    }
    
    // Named function for dot click handler to allow removal
    function handleDotClick() {
        // `this` refers to the dot button. Find its index.
        const clickedIndex = Array.from(dotsContainer.children).indexOf(this);
        if (clickedIndex !== -1) {
            currentIndex = clickedIndex;
            updateCarousel();
            resetAutoPlay();
        }
    }


    function showNext() {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    }

    function startAutoPlay() {
        stopAutoPlay();
        if (totalItems > 1) {
             autoPlayIntervalGoogleReviews = setInterval(showNext, autoPlayDelay);
        }
    }

    function stopAutoPlay() {
        if (autoPlayIntervalGoogleReviews) {
            clearInterval(autoPlayIntervalGoogleReviews);
            autoPlayIntervalGoogleReviews = null;
        }
    }

    function resetAutoPlay() {
        if (totalItems > 1) {
            stopAutoPlay();
            startAutoPlay();
        }
    }
    
    // Event listeners for prev/next buttons
    // Add a flag to prevent multiple attachments if re-initialized
    if (nextButton && !nextButton.dataset.carouselListenerAttached) {
        nextButton.addEventListener('click', () => {
            showNext();
            resetAutoPlay();
        });
        nextButton.dataset.carouselListenerAttached = 'true';
    }
    if (prevButton && !prevButton.dataset.carouselListenerAttached) {
        prevButton.addEventListener('click', () => {
            showPrev();
            resetAutoPlay();
        });
        prevButton.dataset.carouselListenerAttached = 'true';
    }

    updateCarousel();
    if (totalItems > 1) {
        startAutoPlay();
    }

    // Pause autoplay on hover/focus
    // Use named functions for these listeners to allow removal if needed, or use flags
    const handleMouseEnter = stopAutoPlay;
    const handleMouseLeave = startAutoPlay;
    const handleFocusIn = stopAutoPlay;
    const handleFocusOut = startAutoPlay;

    if (totalItems > 1) {
        if (!carouselWrapper.dataset.carouselInteractionListeners) {
            carouselWrapper.addEventListener('mouseenter', handleMouseEnter);
            carouselWrapper.addEventListener('mouseleave', handleMouseLeave);
            carouselWrapper.addEventListener('focusin', handleFocusIn);
            carouselWrapper.addEventListener('focusout', handleFocusOut);
            carouselWrapper.dataset.carouselInteractionListeners = 'true';
        }
    }
}

document.addEventListener('DOMContentLoaded', initializeGoogleReviewsCarousel);

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        initializeGoogleReviewsCarousel(); // Call the specific initialization function
    }
});