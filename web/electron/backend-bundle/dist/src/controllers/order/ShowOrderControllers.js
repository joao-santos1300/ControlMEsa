"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowOrderControllers = void 0;
const ShowOrderServices_1 = require("../../services/order/ShowOrderServices");
class ShowOrderControllers {
    async handle(req, res) {
        const result = await new ShowOrderServices_1.ShowOrderServices().execute({
            orderId: req.params.id,
            userId: req.userId,
            role: req.userRole,
        });
        return res.json(result);
    }
}
exports.ShowOrderControllers = ShowOrderControllers;
