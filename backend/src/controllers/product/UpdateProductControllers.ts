import { Request, Response } from "express";
import { UpdateProductServices } from "../../services/product/UpdateProductServices";

class UpdateProductControllers {
  async handle(req: Request, res: Response) {
    const result = await new UpdateProductServices().execute({ ...req.body, id: req.params.id });
    return res.json(result);
  }
}

export { UpdateProductControllers };
