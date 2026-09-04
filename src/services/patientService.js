const { prisma } = require("../db/prisma");

async function addPatient(tx, data) {
    return tx.patient.create({
        data,
    });
}

async function updatePatient(tx, patient) {
    return tx.patient.update({
        where: { id: patient.id },
        data: {
            
        },
    });
}

module.exports = {
    addPatient,
    updatePatient
};