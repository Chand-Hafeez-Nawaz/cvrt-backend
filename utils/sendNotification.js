const axios = require("axios");

// ======================================
// SEND EXPO PUSH NOTIFICATION
// ======================================

const sendNotification = async ({
  expoPushTokens,
  title,
  body,
  data = {},
}) => {

  try {

    // Make sure tokens are always an array
    const tokens = Array.isArray(expoPushTokens)
      ? expoPushTokens
      : [expoPushTokens];

    // Remove empty tokens
    const validTokens = tokens.filter(
      (token) =>
        token &&
        typeof token === "string" &&
        token.startsWith("ExponentPushToken[")
    );

    if (validTokens.length === 0) {

      console.log(
        "No valid Expo push tokens found."
      );

      return {
        success: false,
        message: "No valid push tokens",
      };

    }

    // =========================
    // CREATE MESSAGES
    // =========================

    const messages = validTokens.map((token) => ({

      to: token,

      sound: "default",

      title,

      body,

      data,

      channelId: "default",

    }));

    // =========================
    // SEND TO EXPO
    // =========================

    const response = await axios.post(

      "https://exp.host/--/api/v2/push/send",

      messages,

      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }

    );

    console.log(
      "Expo notification response:",
      response.data
    );

    return {

      success: true,

      response: response.data,

    };

  } catch (error) {

    console.log(
      "SEND NOTIFICATION ERROR:",
      error.response?.data ||
      error.message
    );

    return {

      success: false,

      message: "Failed to send notification",

      error:
        error.response?.data ||
        error.message,

    };

  }

};

module.exports = sendNotification;