const { prisma } = require("../db/prisma");

async function getAppointmentById(id) {
    return prisma.appointment.findUnique({
        where: { id },
    });
}

async function createAppointment(data) {
    return prisma.appointment.create({
        data,
    });
}

async function updateAppointment(id, data) {
    return prisma.appointment.update({
        where: { id },
        data,
    });
}

async function getDoctorAppointmentsByDate(doctorId, date) {
    return prisma.appointment.findMany({
        where: {
            doctorId,
            date,
        },
    });
}

async function getAppointments(query) {
    const limit = parseInt(query.limit, 10) || 10;
    const offset = parseInt(query.offset, 10) || 0;

    let whereClause = {};

    if (query.doctorId) {
        whereClause.doctorId = parseInt(query.doctorId, 10);
    }

    if (query.patientId) {
        whereClause.patientId = parseInt(query.patientId, 10);
    }

    if (query.date) {
        whereClause.date = query.date;
    }

    if (query.status) {
        whereClause.status = query.status;
    }

    return prisma.appointment.findMany({
        skip: offset,
        take: limit,
        orderBy: {
            date: query.order === 'desc' ? 'desc' : 'asc',
        },
        where: whereClause
    });
}

module.exports = {
    createAppointment,
    getDoctorAppointmentsByDate,
    updateAppointment,
    getAppointmentById,
    getAppointments
}