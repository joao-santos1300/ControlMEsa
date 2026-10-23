"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSessionServices = void 0;
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma_1 = require("../../prisma");
class AuthSessionServices {
    async execute({ email, password }) {
        if (!email || !password)
            throw new Error("Email ou senha incorretos!");
        const user = await prisma_1.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
        if (!user || !user.active)
            throw new Error("Email ou senha incorretos!");
        const passwordMatch = await (0, bcryptjs_1.compare)(password, user.password);
        if (!passwordMatch)
            throw new Error("Email ou senha incorretos!");
        const token = (0, jsonwebtoken_1.sign)({ role: user.role }, process.env.JWT_SECRET, {
            subject: user.id,
            expiresIn: "12h",
        });
        return { id: user.id, name: user.name, email: user.email, role: user.role, token };
    }
}
exports.AuthSessionServices = AuthSessionServices;
