"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListMineOrderControllers = void 0;
const ListMineOrderServices_1 = require("../../services/order/ListMineOrderServices");
class ListMineOrderControllers {
    async handle(req, res) {
        const result = await new ListMineOrderServices_1.ListMineOrderServices().execute({ userId: req.userId });
        return res.json(result);
    }
}
exports.ListMineOrderControllers = ListMineOrderControllers;
