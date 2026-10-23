"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTableControllers = void 0;
const ListTableServices_1 = require("../../services/table/ListTableServices");
class ListTableControllers {
    async handle(req, res) {
        const result = await new ListTableServices_1.ListTableServices().execute();
        return res.json(result);
    }
}
exports.ListTableControllers = ListTableControllers;
