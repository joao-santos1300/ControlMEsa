import { Request, Response } from "express";
import { UpdateTableServices } from "../../services/table/UpdateTableServices";

class UpdateTableControllers {
  async handle(req: Request, res: Response) {
    const result = await new UpdateTableServices().execute({ ...req.body, id: req.params.id });
    return res.json(result);
  }
}

export { UpdateTableControllers };
