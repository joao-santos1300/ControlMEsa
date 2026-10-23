import { Request, Response } from "express";
import { CreateProductServices } from "../../services/product/CreateProductServices";

class CreateProductControllers {
  async handle(req: Request, res: Response) {
    const result = await new CreateProductServices().execute({ ...req.body });
    return res.json(result);
  }
}

export { CreateProductControllers };
