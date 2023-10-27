import nodemailer from 'nodemailer'
import {generate} from 'otp-generator'

export const transporter = nodemailer.createTransport({
port: 465,               // true for 465, false for other ports
host: "smtp.gmail.com",
   auth: {
        user: 'riseimstechnologies@gmail.com',
        pass: 'kwrsixutcfnrfbgq',
     },
secure: true,
});


// console.log(generate(4,{digits:true,lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false}))