"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateItemStatusKitchenControllers = void 0;
const UpdateItemStatusKitchenServices_1 = require("../../services/kitchen/UpdateItemStatusKitchenServices");
class UpdateItemStatusKitchenControllers {
    async handle(req, res) {
        const result = await new UpdateItemStatusKitchenServices_1.UpdateItemStatusKitchenServices().execute({ ...req.body, orderId: req.params.id, itemId: req.params.itemId });
        return res.json(result);
    }
}
exports.UpdateItemStatusKitchenControllers = UpdateItemStatusKitchenControllers;
