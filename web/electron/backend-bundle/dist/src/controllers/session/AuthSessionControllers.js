"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSessionControllers = void 0;
const AuthSessionServices_1 = require("../../services/session/AuthSessionServices");
class AuthSessionControllers {
    async handle(req, res) {
        const result = await new AuthSessionServices_1.AuthSessionServices().execute({ ...req.body });
        return res.json(result);
    }
}
exports.AuthSessionControllers = AuthSessionControllers;
