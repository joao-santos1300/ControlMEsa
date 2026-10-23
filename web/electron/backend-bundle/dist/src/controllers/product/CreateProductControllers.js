"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductControllers = void 0;
const CreateProductServices_1 = require("../../services/product/CreateProductServices");
class CreateProductControllers {
    async handle(req, res) {
        const result = await new CreateProductServices_1.CreateProductServices().execute({ ...req.body });
        return res.json(result);
    }
}
exports.CreateProductControllers = CreateProductControllers;
