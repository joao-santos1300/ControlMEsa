"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateItemOrderControllers = void 0;
const UpdateItemOrderServices_1 = require("../../services/order/UpdateItemOrderServices");
class UpdateItemOrderControllers {
    async handle(req, res) {
        const result = await new UpdateItemOrderServices_1.UpdateItemOrderServices().execute({ ...req.body, orderId: req.params.id, itemId: req.params.itemId, userId: req.userId });
        return res.json(result);
    }
}
exports.UpdateItemOrderControllers = UpdateItemOrderControllers;
