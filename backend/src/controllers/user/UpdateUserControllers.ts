import { Request, Response } from "express";
import { UpdateUserServices } from "../../services/user/UpdateUserServices";

class UpdateUserControllers {
  async handle(req: Request, res: Response) {
    const result = await new UpdateUserServices().execute({ ...req.body, id: req.params.id });
    return res.json(result);
  }
}

export { UpdateUserControllers };
