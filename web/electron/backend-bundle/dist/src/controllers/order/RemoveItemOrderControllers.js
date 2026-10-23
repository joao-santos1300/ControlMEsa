"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveItemOrderControllers = void 0;
const RemoveItemOrderServices_1 = require("../../services/order/RemoveItemOrderServices");
class RemoveItemOrderControllers {
    async handle(req, res) {
        const result = await new RemoveItemOrderServices_1.RemoveItemOrderServices().execute({ orderId: req.params.id, itemId: req.params.itemId, userId: req.userId });
        return res.json(result);
    }
}
exports.RemoveItemOrderControllers = RemoveItemOrderControllers;
