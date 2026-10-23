"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserControllers = void 0;
const DeleteUserServices_1 = require("../../services/user/DeleteUserServices");
class DeleteUserControllers {
    async handle(req, res) {
        const result = await new DeleteUserServices_1.DeleteUserServices().execute({ id: req.params.id });
        return res.json(result);
    }
}
exports.DeleteUserControllers = DeleteUserControllers;
