import { Request, Response } from "express";
import { ListUserServices } from "../../services/user/ListUserServices";

class ListUserControllers {
  async handle(req: Request, res: Response) {
    const result = await new ListUserServices().execute();
    return res.json(result);
  }
}

export { ListUserControllers };
