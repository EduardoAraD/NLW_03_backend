import nodemailer from 'nodemailer';
const hbs = require('nodemailer-express-handlebars');
import path from 'path';

const { host, port, user, pass } = require('../config/mail.json')

export const transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass }
});

transport.use('compile', hbs({
    viewEngine: 'handlebars',
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
}))

//module.exports = transport;