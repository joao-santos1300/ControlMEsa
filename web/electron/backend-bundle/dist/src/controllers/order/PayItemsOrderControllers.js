"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayItemsOrderControllers = void 0;
const PayItemsOrderServices_1 = require("../../services/order/PayItemsOrderServices");
class PayItemsOrderControllers {
    async handle(req, res) {
        const result = await new PayItemsOrderServices_1.PayItemsOrderServices().execute({
            orderId: req.params.id,
            userId: req.userId,
            role: req.userRole,
            items: req.body.items,
        });
        return res.json(result);
    }
}
exports.PayItemsOrderControllers = PayItemsOrderControllers;
