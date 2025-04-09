require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Contact Form Handler
const sendContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_PORT == 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            to: process.env.CONTACT_FORM_RECIPIENT,
            subject: `Contact from ${name}`,
            text: message,
            replyTo: email
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Message failed to send' });
    }
};

// Stripe Checkout Handler
const createCheckoutSession = async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: process.env.STRIPE_PRICE_ID,
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.YOUR_DOMAIN}/success.html`,
            cancel_url: `${process.env.YOUR_DOMAIN}/cancel.html`
        });
        
        res.json({ id: session.id });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Checkout failed' });
    }
};

// Export handlers for Vercel
module.exports = {
    sendContact,
    createCheckoutSession
};

// Local development server
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}
