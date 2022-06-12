const nodemailer = require("nodemailer");
require('dotenv').config();

let transporter = nodemailer.createTransport({
  pool: true,
  host: "mail.privateemail.com",
  port: 465,
  secure: true, // use TLS
  auth: {
    user: "noreply@syntech.dev",
    pass: "Gunner0099"
  },
});

function sender(to, subject, text) {
        let mailOptions = {
            from: "noreply@syntech.dev",
            to: to,
            subject: subject,
            text: text
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                return true;
            }
        });
}

module.exports = sender;