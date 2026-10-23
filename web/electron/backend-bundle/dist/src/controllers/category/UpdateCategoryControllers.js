"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategoryControllers = void 0;
const UpdateCategoryServices_1 = require("../../services/category/UpdateCategoryServices");
class UpdateCategoryControllers {
    async handle(req, res) {
        const result = await new UpdateCategoryServices_1.UpdateCategoryServices().execute({ ...req.body, id: req.params.id });
        return res.json(result);
    }
}
exports.UpdateCategoryControllers = UpdateCategoryControllers;
