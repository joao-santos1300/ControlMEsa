import { Request, Response } from "express";
import { DeleteUserServices } from "../../services/user/DeleteUserServices";

class DeleteUserControllers {
  async handle(req: Request, res: Response) {
    const result = await new DeleteUserServices().execute({ id: req.params.id });
    return res.json(result);
  }
}

export { DeleteUserControllers };
