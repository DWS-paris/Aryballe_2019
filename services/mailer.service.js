/*
Import
*/
    const nodemailer = require("nodemailer");
//

/*
Config
*/
    const sendEmail = (userData, clearPassword) => {
        return new Promise( async (resolve, reject) => {
            // Create transporter
            const transporter = nodemailer.createTransport({
                host: process.env.MAILER_HOST,
                port: 465,
                secure: true,
                auth: {
                  user: process.env.MAILER_USER,
                  pass: process.env.MAILER_PASS
                }
            });

            // Setup email
            const mailOptions = {
                from: process.env.MAILER_SENDER,
                to: userData.email,
                subject: process.env.MAILER_SUBJECT,
                html: `
                    <h1>MEAN Boilerplate: account validation</h1>
                    <p>Thanks for registering your account, to validate it please click on the link below:</p>
                    <p><a href="${process.env.MAILER_LINK}/${userData._id}">Validation link</a></p>
                    <p>Kind regards from the Internet</p>
               `
            };

            // Sed email
            const email = await transporter.sendMail(mailOptions);
            if(email) return resolve(email)
            else return reject(null)
        })
    }
//

/*
Export
*/
    module.exports = { sendEmail };
//