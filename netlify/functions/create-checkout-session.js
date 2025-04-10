require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  const domainURL = process.env.URL; // Netlify provides the site URL in process.env.URL

  if (!priceId) {
    console.error('Stripe Price ID not configured in environment variables.');
    return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Payment configuration error (Price ID).' }) };
  }
  if (!domainURL) {
    console.error('Site domain URL not found in environment variables.');
     // Fallback or default domain if needed, though Netlify should provide it
     // const domainURL = 'YOUR_FALLBACK_URL'; 
     return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Server configuration error (Domain).' }) };
  }
   if (!process.env.STRIPE_SECRET_KEY) {
     console.error('Stripe Secret Key not configured.');
     return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Payment configuration error (Secret Key).' }) };
   }


  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/cancel.html`,
    });

    console.log(`Stripe session created successfully via Netlify function: ${session.id}`);
    return { statusCode: 200, body: JSON.stringify({ success: true, id: session.id }) };

  } catch (error) {
    console.error('Error creating Stripe checkout session via Netlify function:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Failed to initiate payment.' }) };
  }
};
