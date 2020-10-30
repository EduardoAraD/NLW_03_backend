import nodemailer from 'nodemailer';
const hbs = require('nodemailer-express-handlebars');
import path from 'path';

import mail from '../config/mail'

export const transport = nodemailer.createTransport({
    service: 'gmail',
    host: mail.host,
    auth: { user: mail.user, pass: mail.pass }
});

transport.use('compile', hbs({
    viewEngine: 'handlebars',
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
}))

//module.exports = transport;