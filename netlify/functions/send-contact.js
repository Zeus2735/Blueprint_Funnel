require('dotenv').config();
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, message } = JSON.parse(event.body);

    // Basic validation
    if (!name || !email || !message) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Please fill in all fields.' }) };
    }

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
      from: `"${name}" <${process.env.EMAIL_USER}>`, // Use sender email from env
      to: process.env.CONTACT_FORM_RECIPIENT,
      replyTo: email,
      subject: `Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Contact form email sent successfully via Netlify function');
    return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Thank you for your message!' }) };

  } catch (error) {
    console.error('Error sending contact form email via Netlify function:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Failed to send message. Please try again later.' }) };
  }
};
