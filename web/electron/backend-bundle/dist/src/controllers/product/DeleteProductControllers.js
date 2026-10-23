"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProductControllers = void 0;
const DeleteProductServices_1 = require("../../services/product/DeleteProductServices");
class DeleteProductControllers {
    async handle(req, res) {
        const result = await new DeleteProductServices_1.DeleteProductServices().execute({ id: req.params.id });
        return res.json(result);
    }
}
exports.DeleteProductControllers = DeleteProductControllers;
