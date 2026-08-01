const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (toEmail, toName, subject, htmlContent) => {
  await transporter.sendMail({
    from: `"${process.env.SENDER_NAME}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: htmlContent,
  });

  console.log("✅ Email sent successfully");
};

module.exports = sendEmail;