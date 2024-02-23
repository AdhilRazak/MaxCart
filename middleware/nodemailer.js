const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.authemail,
        pass: process.env.apppassword,
      },
    });

    const mailOption = {
      from: {
        name: 'maxcart',
        address: "razakadhil49@gmail.com",
      },
      to: email,
      subject: "OTP from max cart Application",
      text: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOption);
    console.log("Mail has been sent successfully");
  } catch (error) {
    console.error("An error occurred while sending email:", error);
    throw error; // Rethrow the error so the caller knows sending the email failed
  }
};

module.exports = {sendEmail};
  