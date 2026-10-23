"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelOrderControllers = void 0;
const CancelOrderServices_1 = require("../../services/order/CancelOrderServices");
class CancelOrderControllers {
    async handle(req, res) {
        const result = await new CancelOrderServices_1.CancelOrderServices().execute({
            orderId: req.params.id,
            userId: req.userId,
            role: req.userRole,
        });
        return res.json(result);
    }
}
exports.CancelOrderControllers = CancelOrderControllers;
