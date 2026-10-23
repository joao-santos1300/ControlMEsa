"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUserControllers = void 0;
const ListUserServices_1 = require("../../services/user/ListUserServices");
class ListUserControllers {
    async handle(req, res) {
        const result = await new ListUserServices_1.ListUserServices().execute();
        return res.json(result);
    }
}
exports.ListUserControllers = ListUserControllers;
