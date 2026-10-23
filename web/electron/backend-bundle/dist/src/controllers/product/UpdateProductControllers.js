"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductControllers = void 0;
const UpdateProductServices_1 = require("../../services/product/UpdateProductServices");
class UpdateProductControllers {
    async handle(req, res) {
        const result = await new UpdateProductServices_1.UpdateProductServices().execute({ ...req.body, id: req.params.id });
        return res.json(result);
    }
}
exports.UpdateProductControllers = UpdateProductControllers;
