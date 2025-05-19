:root {
    --primary-color: #005A9C; /* A deeper, professional blue */
    --secondary-color: #007bff; /* A brighter blue for accents if needed */
    --text-color: #333;
    --background-color: #f4f4f4;
    --light-text-color: #ffffff;
    --transparent-white-text-shadow: 0 0 2px rgba(0, 0, 0, 0.3), 0 0 5px rgba(255, 255, 255, 0.65); /* Adjusted transparency */
    --card-background: rgba(255, 255, 255, 0.9);
    --navbar-height: 60px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
    background-image: url('https://example.com/your-nice-wallpaper.jpg'); /* Replace with your actual wallpaper */
    background-size: cover;
    background-position: center;
    background-attachment: fixed; /* Keeps wallpaper static during scroll */
}

.hero-section {
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://example.com/your-hero-image.jpg'); /* Replace with your hero image */
    background-size: cover;
    background-position: center;
    height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0 20px;
    color: var(--light-text-color);
}

.hero-content .main-hero-title { /* Targeting the main hero title for new color */
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #4A90E2; /* New specific blue color -  A modern, slightly desaturated blue */
    text-shadow: 1px 1px 2px rgba(0,0,0,0.7); /* Keep a slight shadow for readability */
}

.hero-content .hero-subtitle {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    color: var(--light-text-color); /* Ensure subtitle is still light */
    text-shadow: var(--transparent-white-text-shadow); /* Use the general transparent shadow */
}


.cta-button {
    display: inline-block;
    background-color: var(--primary-color);
    color: var(--light-text-color);
    padding: 12px 25px;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    transition: background-color 0.3s ease;
    border: none;
    cursor: pointer;
}

.cta-button:hover {
    background-color: var(--secondary-color);
}

/* Navbar Styles */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(51, 51, 51, 0.85); /* Slightly transparent navbar */
    backdrop-filter: blur(5px); /* Frosted glass effect for modern browsers */
    padding: 0 20px;
    height: var(--navbar-height);
    position: sticky;
    top: 0;
    z-index: 1000;
    width: 100%;
}

.nav-logo {
    color: var(--light-text-color);
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-menu {
    list-style: none;
    display: flex;
    flex-direction: column; /* Stack items vertically for mobile menu */
    position: absolute;
    top: var(--navbar-height);
    left: 0;
    width: 100%;
    background-color: rgba(40, 40, 40, 0.95);
    backdrop-filter: blur(5px);
    transform: translateY(-110%); /* Start hidden */
    transition: transform 0.3s ease-in-out;
    padding-bottom: 10px; /* Add some padding at the bottom of the open menu */
}

.nav-menu.active {
    transform: translateY(0);
}

.nav-menu li {
    width: 100%;
    text-align: center;
}

.nav-menu li a {
    color: var(--light-text-color);
    text-decoration: none;
    padding: 15px 20px;
    display: block;
    transition: background-color 0.3s ease;
}

.nav-menu li a:hover {
    background-color: var(--primary-color);
}

.nav-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
}

.hamburger {
    display: block;
    width: 25px;
    height: 3px;
    background-color: var(--light-text-color);
    position: relative;
    transition: transform 0.3s ease, background-color 0.3s ease;
}

.hamburger::before,
.hamburger::after {
    content: '';
    position: absolute;
    width: 25px;
    height: 3px;
    background-color: var(--light-text-color);
    left: 0;
    transition: transform 0.3s ease, top 0.3s ease, bottom 0.3s ease;
}

.hamburger::before {
    top: -8px;
}

.hamburger::after {
    bottom: -8px;
}

/* Active (X) state for hamburger */
.nav-toggle.active .hamburger {
    background-color: transparent; /* Middle bar disappears */
}
.nav-toggle.active .hamburger::before {
    transform: rotate(45deg);
    top: 0;
}
.nav-toggle.active .hamburger::after {
    transform: rotate(-45deg);
    bottom: 0; /* Align with the new top of before */
}


/* General Content Section Styling */
.content-section {
    padding: 60px 20px;
    background-color: rgba(0, 0, 0, 0.3); /* Semi-transparent dark overlay for content sections */
    margin: 20px; /* Add some margin around sections */
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.content-section h2 {
    text-align: center;
    margin-bottom: 30px;
    font-size: 1.8rem;
    color: var(--light-text-color); /* Make section titles white */
    text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

.transparent-white-text { /* Apply this class to any text needing the effect */
    color: var(--light-text-color);
    text-shadow: var(--transparent-white-text-shadow);
    margin-bottom: 10px; /* Add some spacing */
}

.service-item {
    background: var(--card-background);
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.service-item h3 {
    color: var(--primary-color);
    margin-bottom: 10px;
}
/* Ensure p inside service item is not transparent white, but normal text color */
.service-item p {
    color: var(--text-color);
    text-shadow: none; /* Override global transparent white if it was applied too broadly */
}


.process-steps {
    list-style: none;
    padding-left: 0;
}

.process-steps li {
    background: var(--card-background);
    margin-bottom: 10px;
    padding: 15px;
    border-radius: 5px;
    border-left: 5px solid var(--primary-color);
    color: var(--text-color); /* Normal text color for readability */
    text-shadow: none; /* Override */
}


/* Google Reviews Section */
#google-reviews-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.review-card {
    background-color: var(--card-background); /* Slightly transparent white */
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.review-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.review-header img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--primary-color);
}

.reviewer-info h4 {
    margin: 0;
    font-size: 1.1em;
    color: var(--primary-color);
}

.review-rating {
    color: #f5b300; /* Gold color for stars */
    font-size: 1em;
}
.review-rating .fa-star-half-alt { /* For half stars */
    color: #f5b300;
}

.review-time {
    font-size: 0.85em;
    color: #777;
    margin-top: -5px; /* Adjust spacing */
}

.review-text {
    font-size: 0.95em;
    line-height: 1.5;
    color: var(--text-color); /* Dark text for readability on light card */
    text-shadow: none; /* Ensure no global text shadow interferes */
}
.review-text a { /* For "Read more" links */
    color: var(--primary-color);
    text-decoration: none;
}
.review-text a:hover {
    text-decoration: underline;
}


/* Contact Form */
.contact-form-section {
    background-color: rgba(20, 20, 20, 0.6); /* Darker overlay for form section */
}
#contact-form label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: var(--light-text-color);
    text-shadow: var(--transparent-white-text-shadow);
}

#contact-form input[type="text"],
#contact-form input[type="email"],
#contact-form input[type="tel"],
#contact-form select,
#contact-form textarea {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    background-color: rgba(255, 255, 255, 0.9); /* Slightly see-through inputs */
    color: #333;
}
#contact-form input[type="text"]:focus,
#contact-form input[type="email"]:focus,
#contact-form input[type="tel"]:focus,
#contact-form select:focus,
#contact-form textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 5px rgba(0, 90, 156, 0.5);
}


#contact-form textarea {
    resize: vertical;
}

.contact-info {
    margin-top: 30px;
    text-align: center;
}
.contact-info p {
    margin-bottom: 10px;
    font-size: 1rem;
    color: var(--light-text-color);
    text-shadow: var(--transparent-white-text-shadow);
}
.contact-info p i {
    margin-right: 10px;
    color: var(--secondary-color);
}
.contact-info a {
    color: var(--light-text-color);
    text-decoration: none;
}
.contact-info a:hover {
    text-decoration: underline;
    color: var(--secondary-color);
}


footer {
    text-align: center;
    padding: 20px;
    background-color: rgba(30, 30, 30, 0.9);
    color: #aaa;
    font-size: 0.9rem;
}

footer p {
    margin-bottom: 5px;
}

footer a {
    color: #ccc;
    text-decoration: none;
}

footer a:hover {
    color: var(--light-text-color);
    text-decoration: underline;
}

/* Responsive adjustments if needed for very small screens, though this is mobile first */
@media (max-width: 360px) {
    .hero-content .main-hero-title {
        font-size: 1.8rem;
    }
    .hero-content .hero-subtitle {
        font-size: 1rem;
    }
    .content-section h2 {
        font-size: 1.6rem;
    }
}