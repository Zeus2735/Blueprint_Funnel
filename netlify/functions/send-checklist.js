require('dotenv').config();
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let leadData;
  try {
    leadData = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing request body for send-checklist:", error);
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Invalid request format.' }) };
  }

  const { name, email } = leadData;

  if (!name || !email) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Name and Email are required.' }) };
  }

  const checklistPdfUrl = process.env.CHECKLIST_PDF_URL || 'YOUR_CHECKLIST_PDF_URL_HERE'; // Placeholder
  const contactRecipient = process.env.CONTACT_FORM_RECIPIENT || 'tyree@example.com'; // Placeholder

  // --- Nodemailer Transporter Setup ---
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // --- 1. Email to the User with the Checklist ---
  try {
    const userMailOptions = {
      from: `"Premier Elite Basketball Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Here is your FREE NIL Monetization Checklist!',
      text: `Hi ${name},\n\nThank you for your interest! You can download your FREE NIL Monetization Checklist here:\n${checklistPdfUrl}\n\nBest regards,\nThe Premier Elite Basketball Academy Team`,
      html: `<p>Hi ${name},</p><p>Thank you for your interest! You can download your FREE NIL Monetization Checklist here:</p><p><a href="${checklistPdfUrl}">Download Checklist</a></p><p>Best regards,<br>The Premier Elite Basketball Academy Team</p>`,
    };
    await transporter.sendMail(userMailOptions);
    console.log(`Checklist email sent successfully to: ${email}`);
  } catch (error) {
    console.error(`Error sending checklist email to ${email}:`, error);
    // We might still want to notify Tyree even if user email fails, or handle this differently
    // For now, we'll log and continue to Tyree's notification.
  }

  // --- 2. Notification Email to Tyree ---
  try {
    const tyreeMailOptions = {
      from: `"Website Lead Capture" <${process.env.EMAIL_USER}>`,
      to: contactRecipient,
      subject: `New Checklist Download Lead: ${name}`,
      text: `A new lead downloaded the NIL Monetization Checklist:\n\nName: ${name}\nEmail: ${email}`,
      html: `<p>A new lead downloaded the NIL Monetization Checklist:</p><ul><li><strong>Name:</strong> ${name}</li><li><strong>Email:</strong> ${email}</li></ul>`,
    };
    await transporter.sendMail(tyreeMailOptions);
    console.log(`Lead notification for checklist sent successfully for: ${email} to ${contactRecipient}`);
  } catch (error) {
    console.error(`Error sending lead notification to Tyree for ${email}:`, error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: 'Thank you! The checklist will be sent to your email shortly.' }),
  };
};
