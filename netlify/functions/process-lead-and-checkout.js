require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let leadData;
  try {
    leadData = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing request body:", error);
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Invalid request format.' }) };
  }

  const { name, email } = leadData;

  // Basic validation
  if (!name || !email) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Name and Email are required.' }) };
  }

  // --- 1. Attempt to send lead notification email ---
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password if Gmail 2FA is on
      },
    });

    const mailOptions = {
      from: `"Website Lead Capture" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_FORM_RECIPIENT, // Send lead to Tyree
      subject: `New NIL Blueprint Lead: ${name}`,
      text: `A new lead expressed interest in the NIL Blueprint:\n\nName: ${name}\nEmail: ${email}`,
      html: `<p>A new lead expressed interest in the NIL Blueprint:</p><ul><li><strong>Name:</strong> ${name}</li><li><strong>Email:</strong> ${email}</li></ul>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Lead notification email sent successfully for: ${email}`);

  } catch (error) {
    // Log the error but don't stop the process, prioritize checkout
    console.error(`Error sending lead notification email for ${email}:`, error);
    // Optionally, you could return an error here if email is critical
    // return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Failed to process lead notification.' }) };
  }

  // --- 2. Proceed to create Stripe Checkout Session ---
  const priceId = process.env.STRIPE_PRICE_ID; // Main product Price ID
  const domainURL = process.env.URL; // Netlify provides this

  if (!priceId || !domainURL || !process.env.STRIPE_SECRET_KEY) {
    console.error('Stripe configuration error (Price ID, Domain, or Secret Key missing).');
    return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Server configuration error.' }) };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      // --- Updated line_items to allow adjustable quantity ---
      line_items: [{
        price: priceId, // Your product's Price ID
        quantity: 1, // Add initial quantity back, it's required by Stripe
        adjustable_quantity: { // Allows quantity change on Stripe page
          enabled: true,
          minimum: 1,
          maximum: 10 // You can adjust this maximum value if needed
        },
      }],
      // --- End of update ---
      mode: 'payment',
      success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/cancel.html`,
      customer_email: email, // Pre-fill customer email
    });

    console.log(`Stripe session created successfully for lead ${email}: ${session.id}`);
    // Return only success and session ID needed by frontend
    return { statusCode: 200, body: JSON.stringify({ success: true, id: session.id }) };

  } catch (error) {
    console.error(`Error creating Stripe checkout session for lead ${email}:`, error);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Failed to initiate payment.' }) };
  }
};
