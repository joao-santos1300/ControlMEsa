"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCategoryControllers = void 0;
const ListCategoryServices_1 = require("../../services/category/ListCategoryServices");
class ListCategoryControllers {
    async handle(req, res) {
        const result = await new ListCategoryServices_1.ListCategoryServices().execute();
        return res.json(result);
    }
}
exports.ListCategoryControllers = ListCategoryControllers;
