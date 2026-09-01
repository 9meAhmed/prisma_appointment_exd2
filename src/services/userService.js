const { prisma } = require("../db/prisma");

async function getUserByEmail(email) {
    return prisma.user.findUnique({
        where: { email },
    });
}

async function getUserByRefreshToken(refreshToken) {
    return prisma.user.findUnique({
        where: { refreshToken },
    });
}

async function addUser(data) {
    return prisma.user.create({
        data,
    });
}

async function updateUser(user) {
    return prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordCode: user.resetPasswordCode,
            resetPasswordCodeExpiry: user.resetPasswordCodeExpiry,
            refreshToken: user.refreshToken,
            refreshTokenExpiry: user.refreshTokenExpiry,
        },
    });
}

async function checkUserExist(email) {
    const user = await prisma.user.findFirst({
        where: { email },
        select: { id: true },
    });

    return Boolean(user);
}

module.exports = {
    addUser,
    checkUserExist,
    getUserByEmail,
    getUserByRefreshToken,
    updateUser
};