document.addEventListener('DOMContentLoaded', function() {
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-toggle i');
        
        question.addEventListener('click', () => {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.display = 'none';
                    otherItem.querySelector('.faq-toggle i').className = 'fas fa-plus';
                }
            });
            
            // Toggle current FAQ item
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                answer.style.display = 'block';
                icon.className = 'fas fa-minus';
            } else {
                answer.style.display = 'none';
                icon.className = 'fas fa-plus';
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Only proceed if href is not just "#" and starts with "#"
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault(); // Prevent default jump only for valid internal links
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
              } // <-- Added missing closing brace for if(targetElement)
            } // <-- Added missing closing brace for if(targetId...)
        });
    });
    
    // Countdown Timer
    function startCountdown() {
        // Set the countdown to 24 hours from now
        const countdownDate = new Date();
        countdownDate.setDate(countdownDate.getDate() + 1);
        
        const countdownTimer = document.getElementById('countdown-timer');
        const copiesLeft = document.getElementById('copies-left');
        const copiesLeftReminder = document.getElementById('copies-left-reminder');
        
        // Initial copies left (random between 40-50 for urgency)
        const initialCopies = Math.floor(Math.random() * 11) + 40;
        copiesLeft.textContent = initialCopies;
        copiesLeftReminder.textContent = initialCopies;
        
        // Update the countdown every second
        const timerInterval = setInterval(function() {
            // Get current date and time
            const now = new Date().getTime();
            
            // Find the distance between now and the countdown date
            const distance = countdownDate - now;
            
            // Time calculations for hours, minutes and seconds
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Display the result
            countdownTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // If the countdown is finished, clear the interval
            if (distance < 0) {
                clearInterval(timerInterval);
                countdownTimer.textContent = "EXPIRED";
            }
        }, 1000);
        
        // Randomly decrease available copies (for urgency)
        setInterval(function() {
            if (parseInt(copiesLeft.textContent) > 1) {
                // 10% chance to decrease by 1
                if (Math.random() < 0.1) {
                    const newCopies = parseInt(copiesLeft.textContent) - 1;
                    copiesLeft.textContent = newCopies;
                    copiesLeftReminder.textContent = newCopies;
                }
            }
        }, 30000); // Check every 30 seconds
    }
    
    startCountdown();
    
    // Video placeholder click handler
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (videoPlaceholder) {
        videoPlaceholder.addEventListener('click', function() {
            // Replace with actual video embed code when available
            this.innerHTML = `
                <div class="video-message">
                    <p>Video coming soon! Check back later for Tyree's explanation of the NIL Blueprint.</p>
                </div>
            `;
        });
    }
    
    // Mobile menu toggle (for smaller screens)
    function setupMobileMenu() {
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');
        
        // Create mobile menu button
        const mobileMenuBtn = document.createElement('div');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        
        // Append to the header's container instead of inserting before nav
        const headerContainer = header.querySelector('.container');
        if (headerContainer) {
             headerContainer.appendChild(mobileMenuBtn); // Append button inside the container
        } else {
             console.error("Header container not found for mobile menu button.");
        }

        // Add click event
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.innerHTML = nav.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : 
                '<i class="fas fa-bars"></i>';
        });
    }
    
    // Only setup mobile menu if screen width is below 768px
    if (window.innerWidth < 768) {
        setupMobileMenu();
    }
    
    // Add animation on scroll (using new class)
    function animateOnScroll() {
        const elements = document.querySelectorAll('.product-highlights, .audiobook-section, .video-section, .testimonials, .pricing, .upsell, .faq, .final-cta, .contact-form-section'); 
        
        // Add fade-slide-up class initially to hide elements
        elements.forEach(el => {
            if (el) { // Check if element exists before adding class
                 el.classList.add('fade-slide-up');
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate'); // Add 'animate' to trigger transition
                    // Optional: Stop observing once animated
                    // observer.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.15 }); // Slightly higher threshold
        
        elements.forEach(element => {
             if (element) { // Check if element exists before observing
                observer.observe(element);
             }
        });
    }
    
    animateOnScroll();

    // --- Contact Form Submission Handler ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default form submission

            // Clear previous status messages
            formStatus.textContent = '';
            formStatus.className = 'form-status'; // Reset classes

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Basic frontend validation (optional, server validates too)
            if (!data.name || !data.email || !data.message) {
                formStatus.textContent = 'Please fill in all fields.';
                formStatus.classList.add('error');
                return;
            }

            try {
                const response = await fetch('/.netlify/functions/send-contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (result.success) {
                    formStatus.textContent = result.message || 'Message sent successfully!';
                    formStatus.classList.add('success');
                    contactForm.reset(); // Clear the form fields
                } else {
                    formStatus.textContent = result.message || 'An error occurred. Please try again.';
                    formStatus.classList.add('error');
                }
            } catch (error) {
                console.error('Error submitting contact form:', error);
                formStatus.textContent = 'An error occurred. Please check your connection and try again.';
                formStatus.classList.add('error');
            }
        });
    }

    // --- Stripe Checkout Button Handler ---
    const checkoutButton = document.getElementById('checkout-button');
    // IMPORTANT: Replace with your actual Stripe Public Key from your .env file
    // Ideally, fetch this key from your backend instead of hardcoding it.
    const stripePublicKey = 'pk_test_51QTlW7AhbY1vKIDZKRjjteEw5FCXiXerqiHrJenkupqAeX9pO1ujADWFuN3wQ60U8Ubx74f2tnrBDTHAiEfyCwtK00PQZFdB9m'; // <-- Updated with your Test Key
    
    if (!stripePublicKey || !stripePublicKey.startsWith('pk_')) {
        console.error('Stripe Public Key is missing or invalid. Please replace the placeholder in script.js');
        // Optionally disable the button or show an error message
        if(checkoutButton) checkoutButton.disabled = true;
    } else if (checkoutButton) {
        const stripe = Stripe(stripePublicKey); // Initialize Stripe.js

        checkoutButton.addEventListener('click', async function(e) {
            console.log('Checkout button clicked!'); // <-- Add log to check if listener fires
            e.preventDefault(); // Prevent default link behavior

            // Optional: Add a loading state to the button
            checkoutButton.textContent = 'Processing...';
            checkoutButton.disabled = true;

            try {
                // Call your backend to create the checkout session
                const response = await fetch('/.netlify/functions/create-checkout-session', {
                    method: 'POST',
                    // You might send additional data here if needed (e.g., selected product)
                    // headers: { 'Content-Type': 'application/json' },
                    // body: JSON.stringify({ items: [...] }) 
                });

                const session = await response.json();

                if (session.success && session.id) {
                    // Redirect to Stripe Checkout
                    const result = await stripe.redirectToCheckout({
                        sessionId: session.id
                    });

                    if (result.error) {
                        // If redirectToCheckout fails due to browser compatibility or network issue
                        console.error('Stripe redirect error:', result.error.message);
                        alert('Could not redirect to payment page. Please try again.'); 
                        // Reset button state
                        checkoutButton.textContent = 'Get My NIL Blueprint + FREE MiCard Now!';
                        checkoutButton.disabled = false;
                    }
                } else {
                    console.error('Failed to create checkout session:', session.message);
                    alert(session.message || 'Could not initiate payment. Please try again.');
                    // Reset button state
                    checkoutButton.textContent = 'Get My NIL Blueprint + FREE MiCard Now!';
                    checkoutButton.disabled = false;
                }
            } catch (error) {
                console.error('Error during checkout process:', error);
                alert('An error occurred during the payment process. Please try again.');
                // Reset button state
                checkoutButton.textContent = 'Get My NIL Blueprint + FREE MiCard Now!';
                checkoutButton.disabled = false;
            }
        });
    } else {
         console.error('Checkout button with ID "checkout-button" not found.');
    }
});
