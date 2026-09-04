const { prisma } = require("../db/prisma");

async function addDoctor(tx, data) {
    return tx.doctor.create({
        data,
    });
}

async function updateDoctor(doctor) {
    return prisma.user.update({
        where: { id: doctor.id },
        data: {
            
        },
    });
}

module.exports = {
    addDoctor,
    updateDoctor
};