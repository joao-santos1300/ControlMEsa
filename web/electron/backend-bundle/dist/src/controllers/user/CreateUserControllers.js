"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserControllers = void 0;
const CreateUserServices_1 = require("../../services/user/CreateUserServices");
class CreateUserControllers {
    async handle(req, res) {
        const result = await new CreateUserServices_1.CreateUserServices().execute({ ...req.body });
        return res.json(result);
    }
}
exports.CreateUserControllers = CreateUserControllers;
