"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProductControllers = void 0;
const ListProductServices_1 = require("../../services/product/ListProductServices");
class ListProductControllers {
    async handle(req, res) {
        const result = await new ListProductServices_1.ListProductServices().execute({
            onlyActive: req.userRole !== "ADMIN",
            categoryId: req.query.categoryId,
            q: req.query.q,
        });
        return res.json(result);
    }
}
exports.ListProductControllers = ListProductControllers;
