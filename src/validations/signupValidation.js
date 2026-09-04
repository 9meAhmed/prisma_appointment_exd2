const Joi = require('joi');


exports.signupSchema = Joi.object({
    body: Joi.object({
        name: Joi.string().trim().required(),
        email: Joi.string().required().email({ tlds: { allow: false } }),
        password: Joi.string().required(),
        role: Joi.string().required().valid('DOCTOR', 'PATIENT'),
    }),
})