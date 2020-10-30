const env = require('../../.env');

export default {
    host: "smtp.gmail.com",
    user: env.email,
    pass: env.pass
}