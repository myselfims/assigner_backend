import { asyncMiddleware } from "../middlewares/async.js";
import { OTP } from "../db/commectAndOtp.js";
import { User } from "../db/user.js";
import { generate } from "otp-generator";
import { transporter } from "../smtp.js";
import { templates } from "../config/emailTemplates.js";
import { generateEmailContent } from "../config/emailTemplates.js";
import Joi from "joi";

const emailSchemal = Joi.object({
  email: Joi.string().email().required(),
});

export const sendOtp = asyncMiddleware(async (req, res) => {

  let { error } = emailSchemal.validate(req.body);

  if (error) return res.status(400).send("Email required");
  let user = await User.findOne({ where: { email: req.body.email } });
  if (!user) return res.status(404).send("Email not registered!");
  let otpcode = generate(4, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  let otpObject = await OTP.create({ code: otpcode, email:req.body.email});
  // otpObject.save()
  const values = {
    userName : user.name,  // User's name for dynamic insertion
    otp : otpObject.code       // The OTP for dynamic insertion
  };
  const template = generateEmailContent("otpTemplate", values);
  const mailData = {
    from:'riseimstechnologies@gmail.com',
    to: req.body.email, // list of receivers
    subject: template.subject,
    text: "",
    html: template.body,
  };

  transporter.sendMail(mailData, (error, info) => {
    if (!error) {
      setTimeout(async () => {
        try {
          await OTP.destroy({ where: { code: otpcode, email: req.body.email } });
          console.log(`OTP record deleted: ${otpcode}`);
        } catch (error) {
          console.error(`Error deleting OTP record: ${error.message}`);
        }
      }, 300000);
      console.log('OTP sent')
      return res.send("OTP sent!");
    } else {
      console.log(error)
      return res.status(500).send("Internal server error!");
    }
  });
});

export const verifyOtp = asyncMiddleware(async (req, res) => {
  if (!req.body.email) return res.status(400).send("email is required!");
  const otpObject = await OTP.findOne({where:{ code: req.params.otp }});
  const user = await User.findOne({where:{email:req.body.email}})
  if (!user) return res.status(400).send("email is not registered!");
  if (!otpObject) return res.status(400).send("OTP is not valid!");
  if (!otpObject.email==req.body.email) return res.status(400).send("email is not valid!");
  user.isVerified = true;
  user.save()
  otpObject.destroy();
  return res.send(user);
});
