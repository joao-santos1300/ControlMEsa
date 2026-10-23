import { Request, Response } from "express";
import { DeleteTableServices } from "../../services/table/DeleteTableServices";

class DeleteTableControllers {
  async handle(req: Request, res: Response) {
    const result = await new DeleteTableServices().execute({ id: req.params.id });
    return res.json(result);
  }
}

export { DeleteTableControllers };
