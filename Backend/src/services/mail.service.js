// import nodemailer from "nodemailer";
// import { google } from "googleapis";
// import dotenv from "dotenv";

// dotenv.config();

// // OAuth client
// /**
//  * @description OAuth client for Google services
//  */
// const oAuth2Client = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     "https://developers.google.com/oauthplayground"
// );

// oAuth2Client.setCredentials({
//     refresh_token: process.env.GOOGLE_REFRESH_TOKEN
// });

// // Create transporter (simple but correct)
// /**
//  * @description Create transporter for sending emails
//  * @returns {Promise<Object>} Transporter object
//  */
// async function getTransporter() {
//     const accessTokenResponse = await oAuth2Client.getAccessToken();

//     const accessToken =
//         typeof accessTokenResponse === "string"
//             ? accessTokenResponse
//             : accessTokenResponse?.token;

//     if (!accessToken) {
//         throw new Error("Access token failed");
//     }

//     return nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             type: "OAuth2",
//             user: process.env.GOOGLE_USER,
//             clientId: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//             accessToken: accessToken
//         }
//     });
// }

// // Send email (simple)
// /**
//  * Send email to a user
//  * @param {Object} options - Email options
//  * @param {string} options.to - Recipient email
//  * @param {string} options.subject - Email subject
//  * @param {string} options.html - HTML content
//  * @param {string} options.text - Plain text content
//  */
// export async function sendEmail({ to, subject, html, text }) {
//     try {
//         const transporter = await getTransporter();

//         const info = await transporter.sendMail({
//             from: process.env.GOOGLE_USER,
//             to,
//             subject,
//             html,
//             text
//         });

//         console.log("✅ Email sent:", info);

//     } catch (error) {
//         console.error("❌ Email error:", error.message);
//     }
// }



import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter (NO manual access token)
function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GOOGLE_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  });
}

// Send email
export async function sendEmail({ to, subject, text, html }) {
  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: process.env.GOOGLE_USER,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
}