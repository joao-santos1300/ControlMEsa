"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseOrderControllers = void 0;
const CloseOrderServices_1 = require("../../services/order/CloseOrderServices");
class CloseOrderControllers {
    async handle(req, res) {
        const result = await new CloseOrderServices_1.CloseOrderServices().execute({ orderId: req.params.id, userId: req.userId, role: req.userRole });
        return res.json(result);
    }
}
exports.CloseOrderControllers = CloseOrderControllers;
