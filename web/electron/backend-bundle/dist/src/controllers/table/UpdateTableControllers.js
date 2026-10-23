"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTableControllers = void 0;
const UpdateTableServices_1 = require("../../services/table/UpdateTableServices");
class UpdateTableControllers {
    async handle(req, res) {
        const result = await new UpdateTableServices_1.UpdateTableServices().execute({ ...req.body, id: req.params.id });
        return res.json(result);
    }
}
exports.UpdateTableControllers = UpdateTableControllers;
