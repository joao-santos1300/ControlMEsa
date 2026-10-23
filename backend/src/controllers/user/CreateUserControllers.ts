import { Request, Response } from "express";
import { CreateUserServices } from "../../services/user/CreateUserServices";

class CreateUserControllers {
  async handle(req: Request, res: Response) {
    const result = await new CreateUserServices().execute({ ...req.body });
    return res.json(result);
  }
}

export { CreateUserControllers };
