import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
port: 465,               // true for 465, false for other ports
host: "smtp.gmail.com",
   auth: {
        user: 'riseimstechnologies@gmail.com',
        pass: 'kwrsixutcfnrfbgq',
     },
secure: true,
});


const mailData = {
    from: 'shaikhimran7585@gmail.com',  // sender address
      to: 'earnonline543@gmail.com',   // list of receivers
      subject: 'Sending Email using Node.js',
      text: 'That was easy!',
      html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer<br/>',
    };

transporter.sendMail(mailData,(error, info)=>{
    if (error){
      console.log(error)
    }else{
      console.log(info)
    }
  })