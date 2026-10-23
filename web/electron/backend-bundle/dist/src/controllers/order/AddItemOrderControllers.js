"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddItemOrderControllers = void 0;
const AddItemOrderServices_1 = require("../../services/order/AddItemOrderServices");
class AddItemOrderControllers {
    async handle(req, res) {
        const result = await new AddItemOrderServices_1.AddItemOrderServices().execute({ ...req.body, orderId: req.params.id, userId: req.userId, role: req.userRole });
        return res.json(result);
    }
}
exports.AddItemOrderControllers = AddItemOrderControllers;
