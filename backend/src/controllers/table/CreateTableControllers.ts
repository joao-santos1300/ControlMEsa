import { Request, Response } from "express";
import { CreateTableServices } from "../../services/table/CreateTableServices";

class CreateTableControllers {
  async handle(req: Request, res: Response) {
    const result = await new CreateTableServices().execute({ ...req.body });
    return res.json(result);
  }
}

export { CreateTableControllers };
