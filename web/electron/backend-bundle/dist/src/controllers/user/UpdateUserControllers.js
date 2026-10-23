"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserControllers = void 0;
const UpdateUserServices_1 = require("../../services/user/UpdateUserServices");
class UpdateUserControllers {
    async handle(req, res) {
        const result = await new UpdateUserServices_1.UpdateUserServices().execute({ ...req.body, id: req.params.id });
        return res.json(result);
    }
}
exports.UpdateUserControllers = UpdateUserControllers;
