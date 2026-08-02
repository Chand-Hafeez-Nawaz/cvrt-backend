const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true only for port 465
  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,

  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
});

const sendEmail = async (toEmail, toName, subject, htmlContent) => {
  try {
    // Verify SMTP connection
    await transporter.verify();
    console.log("✅ SMTP Server Connected");

    // Send mail
    const info = await transporter.sendMail({
      from: `"${process.env.SENDER_NAME}" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    console.log("✅ Email sent successfully");
    console.log("Message ID:", info.messageId);

    return info;
  } catch (err) {
    console.error("❌ Mail Error:");
    console.error(err);

    throw err;
  }
};

module.exports = sendEmail;