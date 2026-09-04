const { get } = require('../app');
const appointmentService = require('../services/appointmentService');

exports.get = async (req, res, next) => {
    try {
        const appointments = await appointmentService.getAppointments(req.query);
        res.status(200).json(appointments);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    const payload = req.body;
    const maxAppointments = 3; 

    try {

        const appointments = await appointmentService.getDoctorAppointmentsByDate(payload.doctorId, payload.date);
       
        if (appointments.length >= maxAppointments) {
            throw new Error("Maximum number of appointments reached for this doctor on this date: " + payload.date);
        }

        const appointment = await appointmentService.createAppointment(payload);

        if(!appointment) {
            throw new Error("Failed to create appointment");
        }

        res.status(201).json(appointment);
    } catch (error) {
        next(error);
    }

};

exports.update = async (req, res, next) => {
    const appointmentId = parseInt(req.params.id, 10);
    const payload = req.body;       

    try {

        const existingAppointment = await appointmentService.getAppointmentById(appointmentId);

        if (!existingAppointment) {
            throw new Error("Appointment not found");
        }

        const updatedAppointment = await appointmentService.updateAppointment(appointmentId, payload);

        if(!updatedAppointment) {
            throw new Error("Failed to update appointment");    
        }  

        res.status(200).json(updatedAppointment);
    } catch (error) {
        next(error);
    }
};