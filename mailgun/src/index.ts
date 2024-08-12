import nodemailer from "nodemailer";

const smtpUsername = process.env.SMTP_USERNAME;
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const fromEmail = process.env.FROM_EMAIL;
const toEmail = process.env.TO_EMAIL;

//Coming from hoom
const userEmail = process.env.EMAIL;
const message = process.env.MESSAGE;

if (
  !smtpUsername ||
  !smtpPassword ||
  !smtpHost ||
  !smtpPort ||
  !fromEmail ||
  !toEmail
) {
  console.error("Missing environment variables");
  process.exit(1);
}

// Create a transporter
const transporter = nodemailer.createTransport({
  host: smtpHost, // Replace with your SMTP host
  port: smtpPort, // Replace with your SMTP port (587 for TLS)
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUsername, // Replace with your SMTP username
    pass: smtpPassword, // Replace with your SMTP password
  },
});

// Send email
const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${fromEmail}>`, // Sender address
      to, // List of receivers
      subject, // Subject line
      text, // Plain text body
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Example usage
sendEmail(toEmail, "New Hoom Message from " + userEmail, message);
