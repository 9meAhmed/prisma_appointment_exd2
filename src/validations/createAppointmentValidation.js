const Joi = require('joi');


exports.createAppointmentSchema = Joi.object({
    body: Joi.object({
        date: Joi.date().required(),
        reason: Joi.string().trim(),
        status: Joi.string().trim(),
        doctorId: Joi.number().integer().required(),
        patientId: Joi.number().integer().required(),

    }),
})