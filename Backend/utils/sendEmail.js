const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Create a transporter using Gmail service
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use an App Password for security
      },
    });

    // Define email options
    const mailOptions = {
      from: `"Event Management" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || "Please view this email in an HTML-supported client.",
      html: html || `<p>${text}</p>`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📨 Message ID: ${info.messageId}`);

    return info; // Returns the email info (useful for debugging)
  } catch (error) {
    console.error("❌ Error sending email:", error.message);

    // Rethrow error for proper error handling
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = sendEmail;
