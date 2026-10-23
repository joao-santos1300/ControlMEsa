"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderControllers = void 0;
const CreateOrderServices_1 = require("../../services/order/CreateOrderServices");
class CreateOrderControllers {
    async handle(req, res) {
        const result = await new CreateOrderServices_1.CreateOrderServices().execute({ ...req.body, waiterId: req.userId });
        return res.json(result);
    }
}
exports.CreateOrderControllers = CreateOrderControllers;
