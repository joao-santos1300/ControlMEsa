"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListKitchenControllers = void 0;
const ListKitchenServices_1 = require("../../services/kitchen/ListKitchenServices");
class ListKitchenControllers {
    async handle(req, res) {
        const result = await new ListKitchenServices_1.ListKitchenServices().execute();
        return res.json(result);
    }
}
exports.ListKitchenControllers = ListKitchenControllers;
