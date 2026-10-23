"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryDashboardControllers = void 0;
const SummaryDashboardServices_1 = require("../../services/dashboard/SummaryDashboardServices");
class SummaryDashboardControllers {
    async handle(req, res) {
        const result = await new SummaryDashboardServices_1.SummaryDashboardServices().execute();
        return res.json(result);
    }
}
exports.SummaryDashboardControllers = SummaryDashboardControllers;
