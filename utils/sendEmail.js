const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (toEmail, toName, subject, htmlContent) => {
  try {
    await emailApi.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_USER,
        name: process.env.SENDER_NAME,
      },

      to: [
        {
          email: toEmail,
          name: toName,
        },
      ],

      subject: subject,

      htmlContent: htmlContent,
    });

    console.log("✅ Email sent successfully");
  } catch (err) {
    console.log("❌ Brevo Error:");
    console.log(err.response?.body || err);
    throw err;
  }
};

module.exports = sendEmail;