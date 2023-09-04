const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const path = require('path')
const fs = require('fs')

const sendEmail = async (email, subject, payload, template) => {
    try {
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
        })

        const source = fs.readFileSync(path.join(__dirname, template), 'utf8')
        const compiledTemplate = handlebars.compile(source)
        const options = () => {
            return {
                from: 'The Queen City Collective',
                to: email,
                subject: subject,
                html: compiledTemplate(payload),
            }
        }

        // Send email
        transporter.sendMail(options(), (error, info) => {
            if (error) {
                console.error(error)
            } else {
                return res.status(200).json({
                    success: true,
                })
            }
        })
    } catch (error) {
        console.error(error)
    }
}

module.exports = sendEmail