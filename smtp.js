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
