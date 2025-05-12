require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Helper function to construct the email body
const constructOrderEmailBody = (customerEmail, name, ebookUrl, audiobookUrl, miCardInfo) => {
  const customerName = name || 'Valued Customer';
  return {
    text: 'Hi ' + customerName + ',\n\nThank you for your purchase of the NIL Blueprint!\n\nHere are your download links:\nNIL Blueprint eBook (PDF): ' + ebookUrl + '\nNIL Blueprint Audiobook (MP3): ' + audiobookUrl + '\n\nMiCard Setup Information:\n' + miCardInfo + '\n\nIf you have any questions, please don\'t hesitate to contact us.\n\nBest regards,\nThe Premier Elite Basketball Academy Team',
    html: '<p>Hi ' + customerName + ',</p>' +
           '<p>Thank you for your purchase of the NIL Blueprint!</p>' +
           '<p><strong>Here are your download links:</strong></p>' +
           '<ul>' +
             '<li><a href="' + ebookUrl + '">NIL Blueprint eBook (PDF)</a></li>' +
             '<li><a href="' + audiobookUrl + '">NIL Blueprint Audiobook (MP3)</a></li>' +
           '</ul>' +
           '<p><strong>MiCard Setup Information:</strong></p>' +
           '<p>' + miCardInfo.replace(/\n/g, '<br>') + '</p>' +
           '<p>If you have any questions, please don\'t hesitate to contact us.</p>' +
           '<p>Best regards,<br>The Premier Elite Basketball Academy Team</p>'
  };
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe Webhook Secret not configured.');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error (webhook secret).' }) };
  }

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed: ' + err.message);
    return { statusCode: 400, body: 'Webhook Error: ' + err.message };
  }

  // Handle the checkout.session.completed event
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    const customerEmail = session.customer_details ? session.customer_details.email : session.customer_email;
    const customerName = session.customer_details ? session.customer_details.name : null;

    if (!customerEmail) {
      console.error('Customer email not found in checkout session:', session.id);
      return { statusCode: 400, body: JSON.stringify({ error: 'Customer email not found.' }) };
    }

    const ebookUrl = process.env.EBOOK_PDF_URL || 'YOUR_EBOOK_PDF_URL_HERE';
    const audiobookUrl = process.env.AUDIOBOOK_MP3_URL || 'YOUR_AUDIOBOOK_MP3_URL_HERE';
    const miCardInfo = process.env.MICARD_SETUP_INFO || 'Your MiCard setup instructions will be provided here. Please ensure this is updated in your environment variables.';

    const emailBody = constructOrderEmailBody(customerEmail, customerName, ebookUrl, audiobookUrl, miCardInfo);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: '"Premier Elite Basketball Academy" <' + process.env.EMAIL_USER + '>',
      to: customerEmail,
      subject: 'Your NIL Blueprint Order Confirmation & Downloads',
      text: emailBody.text,
      html: emailBody.html,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Order fulfillment email sent successfully to: ' + customerEmail + ' for session ' + session.id);
      return { statusCode: 200, body: JSON.stringify({ received: true, message: 'Fulfillment email sent.' }) };
    } catch (error) {
      console.error('Error sending fulfillment email to ' + customerEmail + ': ' + error);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send fulfillment email.' }) };
    }
  } else {
    console.log('Received unhandled event type: ' + stripeEvent.type);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
