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
        }); // End of question.addEventListener
    }); // End of faqItems.forEach
    
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
              } // End of if(targetElement)
            } // End of if(targetId...)
        }); // End of anchor.addEventListener
    }); // End of document.querySelectorAll('a[href^="#"]').forEach
    
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
        if (copiesLeft) copiesLeft.textContent = initialCopies;
        if (copiesLeftReminder) copiesLeftReminder.textContent = initialCopies;
        
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
            if (countdownTimer) {
                countdownTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // If the countdown is finished, clear the interval
            if (distance < 0) {
                clearInterval(timerInterval);
                if (countdownTimer) countdownTimer.textContent = "EXPIRED";
            }
        }, 1000);
        
        // Randomly decrease available copies (for urgency)
        setInterval(function() {
            if (copiesLeft && parseInt(copiesLeft.textContent) > 1) {
                // 10% chance to decrease by 1
                if (Math.random() < 0.1) {
                    const newCopies = parseInt(copiesLeft.textContent) - 1;
                    copiesLeft.textContent = newCopies;
                    if (copiesLeftReminder) copiesLeftReminder.textContent = newCopies;
                }
            }
        }, 30000); // Check every 30 seconds
    }
    
    startCountdown();
    
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
        if (headerContainer && nav) { // Check if nav exists too
             headerContainer.appendChild(mobileMenuBtn); // Append button inside the container
             
             // Add click event only if button and nav exist
             mobileMenuBtn.addEventListener('click', function() {
                 nav.classList.toggle('active');
                 this.innerHTML = nav.classList.contains('active') ? 
                     '<i class="fas fa-times"></i>' : 
                     '<i class="fas fa-bars"></i>';
             });
        } else {
             console.error("Header container or nav not found for mobile menu button setup.");
        }
    }
    
    // Only setup mobile menu if screen width is below 768px
    if (window.innerWidth < 768) {
        setupMobileMenu();
    }
    
    // Add fade-in animation on scroll
    function setupScrollAnimations() {
        // Select all elements you want to fade in
        const elementsToAnimate = document.querySelectorAll('.hero-content, .hero-image, .feature-card, .step-card, .stat-item, .testimonial-card, .offer-box, .service-card, .faq-item, .final-cta > .container > *:not(.cta-button), .contact-form'); // Add more selectors as needed

        // Add the initial fade-in class to hide them
        elementsToAnimate.forEach(el => {
            el.classList.add('fade-in');
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add the 'visible' class to trigger the animation
                    entry.target.classList.add('visible');
                    // Optional: Stop observing the element once it's visible
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        // Observe each element
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
    }

    setupScrollAnimations(); // Call the animation setup function

    // --- Contact Form Submission Handler ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        const submitButton = contactForm.querySelector('button[type="submit"]'); // Get the submit button

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default form submission

            // Disable button and show sending state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
            }

            // Clear previous status messages
            if (formStatus) {
                formStatus.textContent = '';
                formStatus.className = 'form-status'; // Reset classes
            }

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Basic frontend validation (optional, server validates too)
            if (!data.name || !data.email || !data.message) {
                if (formStatus) {
                    formStatus.textContent = 'Please fill in all fields.';
                    formStatus.classList.add('error');
                }
                 if (submitButton) { // Re-enable button
                     submitButton.disabled = false;
                     submitButton.textContent = 'Send Message';
                 }
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
                    if (formStatus) {
                        formStatus.textContent = result.message || 'Message sent successfully!';
                        formStatus.classList.add('success');
                    }
                    contactForm.reset(); // Clear the form fields
                    if (submitButton) { // Reset button on success
                         submitButton.disabled = false;
                         submitButton.textContent = 'Send Message';
                    }
                } else {
                    if (formStatus) {
                        formStatus.textContent = result.message || 'An error occurred. Please try again.';
                        formStatus.classList.add('error');
                    }
                     if (submitButton) { // Re-enable button on error
                         submitButton.disabled = false;
                         submitButton.textContent = 'Send Message';
                     }
                }
            } catch (error) {
                console.error('Error submitting contact form:', error);
                if (formStatus) {
                    formStatus.textContent = 'An error occurred. Please check your connection and try again.';
                    formStatus.classList.add('error');
                }
                 if (submitButton) { // Re-enable button on fetch error
                     submitButton.disabled = false;
                     submitButton.textContent = 'Send Message';
                 }
            }
        });
    }

    // --- Stripe Initialization (needed for modal submission) ---
    let stripe; // Declare stripe variable in a broader scope
    const stripePublicKey = 'pk_live_51QTlW7AhbY1vKIDZoSTH2CnZ2Hn398FR1Ry0hYUSygDLO242gLAFPps3rts1daNnqnm851rHfpIh4QCR2SQTTwOj008evm180L'; // <-- LIVE Key
    
    if (!stripePublicKey || !stripePublicKey.startsWith('pk_live')) { 
        console.error('Stripe LIVE Public Key is missing or invalid in script.js');
    } else {
        try {
            stripe = Stripe(stripePublicKey); // Initialize Stripe.js here
        } catch (e) {
            console.error("Error initializing Stripe:", e);
        }
    }

    // --- Lead Capture Modal Logic ---
    const modalOverlay = document.getElementById('lead-capture-modal');
    const leadCaptureForm = document.getElementById('lead-capture-form');
    const modalFormStatus = document.getElementById('modal-form-status');
    const originalCheckoutButton = document.getElementById('checkout-button'); // The button that OPENS the modal

    // Function to open the modal
    function openModal() {
        if (modalOverlay) {
            modalOverlay.style.display = 'flex'; // Show overlay
            setTimeout(() => modalOverlay.classList.add('active'), 10); // Add active class for transition
        }
    }

    // Function to close the modal
    window.closeModal = function() { // Make it global so inline onclick works
        if (modalOverlay) {
            modalOverlay.classList.remove('active'); // Remove active class
             // Reset form status if needed
            if(modalFormStatus) {
                modalFormStatus.textContent = '';
                modalFormStatus.className = 'form-status';
            }
            // Wait for transition before hiding
            setTimeout(() => {
                if (modalOverlay) modalOverlay.style.display = 'none';
            }, 300); 
        }
    }

    // Modify the original checkout button's listener to OPEN the modal
    if (originalCheckoutButton) {
         originalCheckoutButton.addEventListener('click', function(e) {
             e.preventDefault(); // Prevent default link behavior (scrolling to #)
             console.log('Original checkout button clicked - opening modal.');
             openModal(); // Call function to show the modal
         });
    } else {
         console.error("Original checkout button (#checkout-button) not found.");
    }


    // Handle submission of the form INSIDE the modal
    if (leadCaptureForm) {
        const modalSubmitButton = leadCaptureForm.querySelector('button[type="submit"]');

        leadCaptureForm.addEventListener('submit', async function(e) {
            e.preventDefault();

             // Disable button and show sending state
            if (modalSubmitButton) {
                modalSubmitButton.disabled = true;
                modalSubmitButton.textContent = 'Processing...';
            }
             // Clear previous status messages
            if(modalFormStatus) {
                modalFormStatus.textContent = '';
                modalFormStatus.className = 'form-status';
            }

            const formData = new FormData(leadCaptureForm);
            const leadData = Object.fromEntries(formData.entries());

            // Basic validation
            if (!leadData.name || !leadData.email) {
                 if(modalFormStatus) {
                    modalFormStatus.textContent = 'Please fill in all fields.';
                    modalFormStatus.classList.add('error');
                 }
                 if (modalSubmitButton) {
                     modalSubmitButton.disabled = false;
                     modalSubmitButton.textContent = 'Proceed to Payment';
                 }
                return;
            }

            // --- Call NEW backend function ---
            try {
                // We need a new backend function: process-lead-and-checkout
                // This function should first email the lead, then create the Stripe session
                const response = await fetch('/.netlify/functions/process-lead-and-checkout', { // <-- NEW ENDPOINT
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadData) 
                });

                const session = await response.json();

                if (session.success && session.id) {
                    // Redirect to Stripe Checkout (using the key already initialized)
                     if (stripe) { // Check if stripe object exists
                        const result = await stripe.redirectToCheckout({ sessionId: session.id });
                        if (result.error) {
                            console.error('Stripe redirect error:', result.error.message);
                             if(modalFormStatus) {
                                modalFormStatus.textContent = 'Could not redirect to payment page. Please try again.';
                                modalFormStatus.classList.add('error');
                             }
                        }
                        // If redirect fails or user comes back, re-enable button
                         if (modalSubmitButton) {
                             modalSubmitButton.disabled = false;
                             modalSubmitButton.textContent = 'Proceed to Payment';
                         }
                    } else {
                         console.error("Stripe object not initialized.");
                          if(modalFormStatus) {
                            modalFormStatus.textContent = 'Payment system error. Please refresh.';
                            modalFormStatus.classList.add('error');
                          }
                           if (modalSubmitButton) {
                             modalSubmitButton.disabled = false;
                             modalSubmitButton.textContent = 'Proceed to Payment';
                         }
                    }
                } else {
                    console.error('Failed to process lead or create checkout session:', session.message);
                     if(modalFormStatus) {
                        modalFormStatus.textContent = session.message || 'Could not initiate payment. Please try again.';
                        modalFormStatus.classList.add('error');
                     }
                      if (modalSubmitButton) {
                         modalSubmitButton.disabled = false;
                         modalSubmitButton.textContent = 'Proceed to Payment';
                     }
                }
            } catch (error) {
                console.error('Error during lead capture/checkout process:', error);
                 if(modalFormStatus) {
                    modalFormStatus.textContent = 'An error occurred. Please check connection.';
                    modalFormStatus.classList.add('error');
                 }
                  if (modalSubmitButton) {
                     modalSubmitButton.disabled = false;
                     modalSubmitButton.textContent = 'Proceed to Payment';
                 }
            }
        });
    }

    // Close modal if clicking outside the content area
     if (modalOverlay) {
         modalOverlay.addEventListener('click', function(e) {
             if (e.target === modalOverlay) { // Check if click is on the overlay itself
                 closeModal();
             }
         });
     }
 
     // Trigger Discord iframe animation on load (Placed correctly before the final '});')
     const discordIframe = document.querySelector('.discord-widget-container iframe'); // Updated selector
     if (discordIframe) {
         // Add a small delay to ensure CSS is applied and iframe has loaded
         setTimeout(() => {
             discordIframe.classList.add('visible');
         }, 500); // Increased delay slightly
     }

    // --- Free Checklist Modal Logic ---
    const checklistModalOverlay = document.getElementById('free-checklist-modal');
    const openChecklistModalBtn = document.getElementById('open-checklist-modal-btn');
    const checklistForm = document.getElementById('free-checklist-form');
    const checklistFormStatus = document.getElementById('checklist-form-status');

    function openChecklistModal() {
        if (checklistModalOverlay) {
            checklistModalOverlay.style.display = 'flex';
            setTimeout(() => checklistModalOverlay.classList.add('active'), 10);
        }
    }

    window.closeChecklistModal = function() { // Make global for inline onclick
        if (checklistModalOverlay) {
            checklistModalOverlay.classList.remove('active');
            if(checklistFormStatus) { // Clear status on close
                checklistFormStatus.textContent = '';
                checklistFormStatus.className = 'form-status';
            }
            setTimeout(() => {
                if (checklistModalOverlay) checklistModalOverlay.style.display = 'none';
            }, 300); // Match CSS transition
        }
    }

    if (openChecklistModalBtn) {
        openChecklistModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openChecklistModal();
        });
    }

    if (checklistModalOverlay) { // Close by clicking outside
        checklistModalOverlay.addEventListener('click', function(e) {
            if (e.target === checklistModalOverlay) {
                closeChecklistModal();
            }
        });
    }

    if (checklistForm) {
        const checklistSubmitButton = checklistForm.querySelector('button[type="submit"]');

        checklistForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (checklistSubmitButton) {
                checklistSubmitButton.disabled = true;
                checklistSubmitButton.textContent = 'Sending...';
            }
            if (checklistFormStatus) {
                checklistFormStatus.textContent = '';
                checklistFormStatus.className = 'form-status';
            }

            const formData = new FormData(checklistForm);
            const data = Object.fromEntries(formData.entries());

            if (!data.name || !data.email) {
                if (checklistFormStatus) {
                    checklistFormStatus.textContent = 'Please fill in all fields.';
                    checklistFormStatus.classList.add('error');
                }
                if (checklistSubmitButton) {
                    checklistSubmitButton.disabled = false;
                    checklistSubmitButton.textContent = 'Download Now';
                }
                return;
            }

            try {
                const response = await fetch('/.netlify/functions/send-checklist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();

                if (result.success) {
                    if (checklistFormStatus) {
                        checklistFormStatus.textContent = result.message || 'Checklist sent! Please check your email.';
                        checklistFormStatus.classList.add('success');
                    }
                    checklistForm.reset();
                    setTimeout(closeChecklistModal, 3000); // Close modal after 3 seconds on success
                } else {
                    if (checklistFormStatus) {
                        checklistFormStatus.textContent = result.message || 'An error occurred. Please try again.';
                        checklistFormStatus.classList.add('error');
                    }
                }
            } catch (error) {
                console.error('Error submitting checklist form:', error);
                if (checklistFormStatus) {
                    checklistFormStatus.textContent = 'An error occurred. Please check your connection and try again.';
                    checklistFormStatus.classList.add('error');
                }
            } finally {
                if (checklistSubmitButton) {
                    checklistSubmitButton.disabled = false;
                    checklistSubmitButton.textContent = 'Download Now';
                }
            }
        });
    }
 
 }); // End of DOMContentLoaded listener
