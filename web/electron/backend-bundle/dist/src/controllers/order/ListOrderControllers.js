"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListOrderControllers = void 0;
const ListOrderServices_1 = require("../../services/order/ListOrderServices");
class ListOrderControllers {
    async handle(req, res) {
        const { status, tableId, waiterId, from, to, page, pageSize } = req.query;
        const result = await new ListOrderServices_1.ListOrderServices().execute({
            userId: req.userId,
            role: req.userRole,
            status,
            tableId,
            waiterId,
            from,
            to,
            page,
            pageSize,
        });
        return res.json(result);
    }
}
exports.ListOrderControllers = ListOrderControllers;
