const Joi = require('joi');
exports.loginSchema = Joi.object({
    body: Joi.object({
        email: Joi.string().required().email({ tlds: { allow: false } }),
        password: Joi.string().required(),
    }),
})