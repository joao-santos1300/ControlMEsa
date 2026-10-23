import { Request, Response } from "express";
import { AuthSessionServices } from "../../services/session/AuthSessionServices";

class AuthSessionControllers {
  async handle(req: Request, res: Response) {
    const result = await new AuthSessionServices().execute({ ...req.body });
    return res.json(result);
  }
}

export { AuthSessionControllers };
