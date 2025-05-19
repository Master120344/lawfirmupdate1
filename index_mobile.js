// Page Load Handler
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const bodyElement = document.body;

    if (bodyElement) {
        bodyElement.classList.add('loaded');
    } else {
        console.error('Body element not found.');
    }

    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500);
    } else {
        console.error('Loader element not found.');
    }
});

// Testimonial Carousel
function initCarousel() {
    const carousel = document.querySelector('.testimonial-carousel');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    let currentIndex = 0;

    if (!carousel || !prevButton || !nextButton) {
        console.error('Carousel elements not found.');
        return;
    }

    const cards = carousel.querySelectorAll('.testimonial-card');
    const cardWidth = cards[0].offsetWidth + 20; // Including gap

    function scrollToCard(index) {
        carousel.scrollTo({
            left: index * cardWidth,
            behavior: 'smooth'
        });
        currentIndex = index;
    }

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            scrollToCard(currentIndex - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < cards.length - 1) {
            scrollToCard(currentIndex + 1);
        }
    });

    // Auto-scroll every 5 seconds
    let autoScroll = setInterval(() => {
        if (currentIndex < cards.length - 1) {
            scrollToCard(currentIndex + 1);
        } else {
            scrollToCard(0);
        }
    }, 5000);

    carousel.addEventListener('touchstart', () => clearInterval(autoScroll));
    carousel.addEventListener('touchend', () => {
        autoScroll = setInterval(() => {
            if (currentIndex < cards.length - 1) {
                scrollToCard(currentIndex + 1);
            } else {
                scrollToCard(0);
            }
        }, 5000);
    });
}

// Scroll Animations
function initScrollAnimations() {
    const elements = document.querySelectorAll('.hero-content h1, .hero-content p, .service-card, .testimonial-card, .about p, .contact-form');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    elements.forEach(element => observer.observe(element));
}

// Contact Form Validation
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) {
        console.error('Contact form not found.');
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();

        if (!name || !email || !message) {
            alert('Please fill out all fields.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Simulate form submission
        form.querySelector('button').disabled = true;
        form.querySelector('button').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

        setTimeout(() => {
            alert('Message sent successfully!');
            form.reset();
            form.querySelector('button').disabled = false;
            form.querySelector('button').innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        }, 2000);
    });
}

// Navigation Active State
function initNavigation() {
    const navLinks = document.querySelectorAll('.tab-link');
    const currentPath = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (href === 'index_mobile.html' && currentPath === '')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize Functions
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initScrollAnimations();
    initContactForm();
    initNavigation();
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});