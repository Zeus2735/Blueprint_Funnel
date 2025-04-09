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
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
            }
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
        
        // Insert before nav
        header.insertBefore(mobileMenuBtn, nav);
        
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
    
    // Add animation on scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.product-highlights, .video-section, .testimonials, .pricing, .upsell, .faq, .final-cta');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });
        
        elements.forEach(element => {
            observer.observe(element);
        });
    }
    
    animateOnScroll();
});
