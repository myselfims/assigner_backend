import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  name: "ims",
  port: 465, // true for 465, false for other ports
  host: "smtp.gmail.com",
  auth: {
    user: "riseimstechnologies@gmail.com",
    pass: "kwrsixutcfnrfbgq",
  },
  secure: true,
});



export const sendEmail = async (to, subject, body ) => { 
  console.log("sending email to :", to)
  const mailData = {
    from: "shaikhimran7585@gmail.com",
    to,
    subject,
    html: body,
  };

  try {
    await transporter.sendMail(mailData);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};