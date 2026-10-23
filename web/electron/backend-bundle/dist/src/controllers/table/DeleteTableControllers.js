"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTableControllers = void 0;
const DeleteTableServices_1 = require("../../services/table/DeleteTableServices");
class DeleteTableControllers {
    async handle(req, res) {
        const result = await new DeleteTableServices_1.DeleteTableServices().execute({ id: req.params.id });
        return res.json(result);
    }
}
exports.DeleteTableControllers = DeleteTableControllers;
