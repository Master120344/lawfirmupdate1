document.addEventListener('DOMContentLoaded', () => {
    const carouselWrapper = document.querySelector('.testimonial-carousel-wrapper');
    if (!carouselWrapper) {
        // console.log("Google Reviews Carousel Wrapper not found.");
        return;
    }

    const carousel = carouselWrapper.querySelector('.testimonial-carousel');
    const items = carousel ? carousel.querySelectorAll('.testimonial-item') : null;
    const prevButton = carouselWrapper.querySelector('.carousel-control.prev'); // Kept for potential re-enablement
    const nextButton = carouselWrapper.querySelector('.carousel-control.next'); // Kept for potential re-enablement
    const dotsContainer = carouselWrapper.querySelector('.carousel-dots');

    // If essential elements are missing OR there are no items,
    // hide controls and the carousel wrapper itself.
    if (!carousel || !items || items.length === 0 || !dotsContainer) {
        // console.log("Essential Google Reviews Carousel elements missing or no items.");
        if(prevButton) prevButton.style.display = 'none';
        if(nextButton) nextButton.style.display = 'none';
        if(dotsContainer) dotsContainer.style.display = 'none';

        // If there are no items, hide the entire carousel wrapper
        if (carouselWrapper && (!items || items.length === 0)) {
            carouselWrapper.style.display = 'none';
        }
        return; // Stop further carousel logic if it's not usable/empty
    }

    // If only one item, hide prev/next buttons and dots. Autoplay won't run.
    if (items.length <= 1) {
        if(prevButton) prevButton.style.display = 'none';
        if(nextButton) nextButton.style.display = 'none';
        if(dotsContainer) dotsContainer.style.display = 'none';
        // Note: Autoplay logic below also checks for totalItems > 1
    }

    let currentIndex = 0;
    const totalItems = items.length;
    let autoPlayInterval;
    const autoPlayDelay = 7000; // 7 seconds

    function updateCarousel() {
        if (carousel) {
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
        updateDots();
    }

    function updateDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = ''; // Clear existing dots
        if (totalItems <= 1) return; // Don't show dots for 0 or 1 item

        for (let i = 0; i < totalItems; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === currentIndex) {
                dot.classList.add('active');
            }
            dot.setAttribute('aria-label', `Go to review ${i + 1}`);
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
                resetAutoPlay();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }

    function showPrev() { // Kept for completeness if arrows are re-enabled
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    }

    function startAutoPlay() {
        stopAutoPlay(); // Clear existing interval
        if (totalItems > 1) { // Only autoplay if more than one item
             autoPlayInterval = setInterval(showNext, autoPlayDelay);
        }
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    function resetAutoPlay() {
        if (totalItems > 1) { // Only reset/restart autoplay if there's something to play
            stopAutoPlay();
            startAutoPlay();
        }
    }

    // Event listeners for prev/next buttons (they are hidden by CSS but logic remains)
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            showNext();
            resetAutoPlay();
        });
    }
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            showPrev();
            resetAutoPlay();
        });
    }

    // Initial setup
    updateCarousel(); // Includes updateDots
    if (totalItems > 1) { // Start autoplay only if more than one item
        startAutoPlay();
    }


    // Pause autoplay on hover/focus for UX and accessibility
    // Ensure these only run if autoplay is relevant (more than 1 item)
    if (totalItems > 1) {
        carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
        carouselWrapper.addEventListener('mouseleave', startAutoPlay);
        carouselWrapper.addEventListener('focusin', stopAutoPlay); // When wrapper or its children get focus
        carouselWrapper.addEventListener('focusout', startAutoPlay); // When focus leaves wrapper and its children
    }
});

// Handle bfcache (back-forward cache) for this specific carousel
// This ensures if the page is loaded from bfcache, the carousel re-initializes correctly.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Re-run the DOMContentLoaded logic if the page is from bfcache.
        // This is a simple way to re-initialize.
        // For more complex scenarios, you might need a more targeted re-init function.
        const domContentLoadedEvent = new Event('DOMContentLoaded');
        document.dispatchEvent(domContentLoadedEvent);
    }
});