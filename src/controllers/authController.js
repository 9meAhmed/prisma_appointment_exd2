require('dotenv').config();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { sendMail } = require('../services/mailerService');
const crypto = require('crypto');
const userService = require('../services/userService');
const doctorService = require('../services/doctorService');
const patientService = require('../services/patientService');
const { prisma } = require("../db/prisma");

exports.signup = async (req, res, next) => {
    const payload = req.body;

    try {

        const isDuplicate = await userService.checkUserExist(payload.email);

        if (isDuplicate) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        payload.password = await bcrypt.hash(payload.password, 10);

        const { user, doctor, patient } = await prisma.$transaction(async (tx) => {

            const newUser = await userService.addUser(tx, payload);
            let doctor = null;
            let patient = null;

            if (!newUser) {
                throw new Error("User creation failed");
            }

            if (newUser.role === 'DOCTOR') {
                doctor = await doctorService.addDoctor(tx, {
                    userId: newUser.id,
                    specialization: payload.specialization || '',
                });

                if (!doctor) {
                    throw new Error("Doctor creation failed");
                }
            } else {
                patient = await patientService.addPatient(tx, {
                    userId: newUser.id,
                });

                if (!patient) {
                    throw new Error("Patient creation failed");
                }
            }

            return {
                user: newUser,
                doctor,
                patient,
            };
        })

        sendMail(user.email, "Signup Success", "Hello world?", "<b>Hello world?</b>");

        res.status(201).json(user);
    } catch (error) {
        next(error);
    }

};

exports.login = async (req, res, next) => {
    const payload = req.body;

    try {

        const user = await userService.getUserByEmail(payload.email);

        if (!user) {
            return res.status(404).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(payload.password, user.password,);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const refreshToken = generateRefreshToken();
        const tokenHash = generateRefreshTokenHash(refreshToken);
        await updateUserRefreshTokenHash(user, tokenHash);
        var token = generateUserAccessToken(user);

        res.status(200).json({ token, refreshToken: tokenHash });

    } catch (error) {
        next(error);
    }

};

exports.refreshToken = async (req, res, next) => {
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];

    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
    }

    const user = await userService.getUserByRefreshToken(refreshToken);

    if (!user) {
        return res.status(401).json({
            message: "Invalid refresh token",
        });
    }

    if (user.refreshTokenExpiry < new Date()) {
        await clearUserRefreshTokenHash(user);
        return res.status(401).json({
            message: "Refresh token expired",
        });
    }

    const newRefreshToken = generateRefreshToken();
    const tokenHash = generateRefreshTokenHash(newRefreshToken);
    await updateUserRefreshTokenHash(user, tokenHash);
    var token = generateUserAccessToken(user);

    res.status(200).json({ token, refreshToken: tokenHash });
}

exports.userProfile = async (req, res, next) => {
    const user = await userService.getUserByEmail(req.user.email);
    return res.status(200).json({ user });
};

exports.forgetPassword = async (req, res, next) => {
    const { email } = req.body;

    const user = await userService.getUserByEmail(email);

    if (!user) {
        res.status(404).json({ message: "User not found" });
    }

    user.resetPasswordCode = generateResetPasswordCode();  // Generate a random 6-character code
    user.resetPasswordCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await userService.updateUser(user);

    sendMail(user.email, "Password Reset Code", `Your password reset code is: ${user.resetPasswordCode}`, `<b>Your password reset code is: ${user.resetPasswordCode}</b>`);
    res.status(200).json({ message: "Password reset code sent to email" });
};

exports.resetPassword = async (req, res, next) => {
    const { email, resetPasswordCode, newPassword } = req.body;

    const user = await userService.getUserByEmail(email);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.resetPasswordCode !== resetPasswordCode || user.resetPasswordCodeExpiry < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset password code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpiry = null;
    await userService.updateUser(user);
    sendMail(user.email, "Password Reset Successful", "Your password has been reset successfully.", "<b>Your password has been reset successfully.</b>");

    res.status(200).json({ message: "Password reset successful" });
};

exports.logout = async (req, res, next) => {
    const user = await userService.getUserByEmail(req.user.email);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    await clearUserRefreshTokenHash(user);

    res.status(200).json({ message: "Logout successful" });
};

exports.resetPassword = async (req, res, next) => {
    const { email, resetPasswordCode, newPassword } = req.body;

    const user = await userService.getUserByEmail(email);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.resetPasswordCode !== resetPasswordCode || user.resetPasswordCodeExpiry < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset password code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpiry = null;
    await userService.updateUser(user);
    sendMail(user.email, "Password Reset Successful", "Your password has been reset successfully.", "<b>Your password has been reset successfully.</b>");

    res.status(200).json({ message: "Password reset successful" });
};

const generateUserAccessToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || '5m' });
}

const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex");
}

const generateRefreshTokenHash = (refreshToken) => {
    return crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
}

const updateUserRefreshTokenHash = async (user, tokenHash) => {
    user.refreshToken = tokenHash;
    user.refreshTokenExpiry = new Date(Date.now() + 8 * 60 * 1000); // 8 minutes from now
    await userService.updateUser(user);
}

const clearUserRefreshTokenHash = async (user) => {
    user.refreshToken = '';
    user.refreshTokenExpiry = null;
    await userService.updateUser(user);
}

const generateResetPasswordCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate a random 6-character code
};