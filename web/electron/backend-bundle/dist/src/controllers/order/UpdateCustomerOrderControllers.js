"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCustomerOrderControllers = void 0;
const UpdateCustomerOrderServices_1 = require("../../services/order/UpdateCustomerOrderServices");
class UpdateCustomerOrderControllers {
    async handle(req, res) {
        const result = await new UpdateCustomerOrderServices_1.UpdateCustomerOrderServices().execute({
            customerName: req.body.customerName,
            orderId: req.params.id,
            userId: req.userId,
        });
        return res.json(result);
    }
}
exports.UpdateCustomerOrderControllers = UpdateCustomerOrderControllers;
