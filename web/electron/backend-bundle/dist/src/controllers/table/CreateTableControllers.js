"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTableControllers = void 0;
const CreateTableServices_1 = require("../../services/table/CreateTableServices");
class CreateTableControllers {
    async handle(req, res) {
        const result = await new CreateTableServices_1.CreateTableServices().execute({ ...req.body });
        return res.json(result);
    }
}
exports.CreateTableControllers = CreateTableControllers;
