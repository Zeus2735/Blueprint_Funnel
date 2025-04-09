require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

// Check if Stripe secret key is loaded
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
    console.error('ERROR: Stripe Secret Key (STRIPE_SECRET_KEY) is missing or invalid in your .env file.');
    console.error('Please ensure the .env file exists in the same directory as server.js and contains a valid STRIPE_SECRET_KEY.');
    process.exit(1); // Exit the application if the key is missing
}

const stripe = require('stripe')(stripeSecretKey); // Initialize Stripe with the validated key

const app = express();
const port = process.env.PORT || 3000; // Use port from .env or default to 3000

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, Assets) from the current directory
app.use(express.static(path.join(__dirname)));

// --- Contact Form Endpoint ---
app.post('/send-contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    // Configure Nodemailer transporter (replace with your email service details)
    // IMPORTANT: Use environment variables for credentials!
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com'
        port: process.env.EMAIL_PORT || 587, // e.g., 587 for TLS
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS, // Your email password or app password
        },
    });

    const mailOptions = {
        from: `"${name}" <${email}>`, // Sender address (might be overridden by email service)
        to: process.env.CONTACT_FORM_RECIPIENT, // Your email address to receive messages
        replyTo: email,
        subject: `Contact Form Submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
               <p><strong>Message:</strong></p>
               <p>${message.replace(/\n/g, '<br>')}</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Contact form email sent successfully');
        res.json({ success: true, message: 'Thank you for your message!' });
    } catch (error) {
        console.error('Error sending contact form email:', error);
        res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
    }
});

// --- Stripe Payment Endpoint ---
// This is a basic structure. You'll need to define your product/price IDs in Stripe
// and potentially handle different products/prices based on frontend request.
app.post('/create-checkout-session', async (req, res) => {
    // TODO: Add logic to determine which product/price ID to use if needed
    const priceId = process.env.STRIPE_PRICE_ID; // Your Stripe Price ID for the NIL Blueprint

    if (!priceId) {
        console.error('Stripe Price ID not configured in .env file');
        return res.status(500).json({ success: false, message: 'Payment configuration error.' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // IMPORTANT: Replace with your actual success and cancel URLs
            success_url: `${process.env.YOUR_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`, // Example success page
            cancel_url: `${process.env.YOUR_DOMAIN}/cancel.html`, // Example cancel page
            // Consider adding automatic_tax: { enabled: true }, if applicable
        });

        res.json({ success: true, id: session.id }); // Send session ID back to the client
    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        res.status(500).json({ success: false, message: 'Failed to initiate payment.' });
    }
});

// --- Serve the main landing page ---
// This route ensures that visiting the root URL serves your index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
