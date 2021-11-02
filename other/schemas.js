const Joi = require('joi');

// Accounts
module.exports = {
    accountSchema: Joi.object({
        email: Joi.string().email().min(10).max(60).required(),
        password: Joi.string().regex(new RegExp('[a-zA-Z0-9]')).min(8).max(30).required()
    }),
}
