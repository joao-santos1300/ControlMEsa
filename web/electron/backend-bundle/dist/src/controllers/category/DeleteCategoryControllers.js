"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCategoryControllers = void 0;
const DeleteCategoryServices_1 = require("../../services/category/DeleteCategoryServices");
class DeleteCategoryControllers {
    async handle(req, res) {
        const result = await new DeleteCategoryServices_1.DeleteCategoryServices().execute({ id: req.params.id });
        return res.json(result);
    }
}
exports.DeleteCategoryControllers = DeleteCategoryControllers;
