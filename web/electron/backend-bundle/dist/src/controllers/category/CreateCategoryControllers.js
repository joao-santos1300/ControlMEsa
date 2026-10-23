"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategoryControllers = void 0;
const CreateCategoryServices_1 = require("../../services/category/CreateCategoryServices");
class CreateCategoryControllers {
    async handle(req, res) {
        const result = await new CreateCategoryServices_1.CreateCategoryServices().execute({ ...req.body });
        return res.json(result);
    }
}
exports.CreateCategoryControllers = CreateCategoryControllers;
