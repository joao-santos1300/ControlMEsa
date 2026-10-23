"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopProductsDashboardControllers = void 0;
const TopProductsDashboardServices_1 = require("../../services/dashboard/TopProductsDashboardServices");
class TopProductsDashboardControllers {
    async handle(req, res) {
        const result = await new TopProductsDashboardServices_1.TopProductsDashboardServices().execute({ from: req.query.from, to: req.query.to, limit: req.query.limit });
        return res.json(result);
    }
}
exports.TopProductsDashboardControllers = TopProductsDashboardControllers;
