"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = isAuthenticated;
const jsonwebtoken_1 = require("jsonwebtoken");
function isAuthenticated(req, res, next) {
    const authToken = req.headers.authorization;
    if (!authToken)
        return res.status(401).json({ error: "Token não informado" });
    const [, token] = authToken.split(" ");
    try {
        const { sub, role } = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
        req.userId = sub;
        req.userRole = role;
        return next();
    }
    catch {
        return res.status(401).json({ error: "Token inválido" });
    }
}
