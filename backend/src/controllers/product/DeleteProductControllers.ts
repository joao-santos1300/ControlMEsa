import { Request, Response } from "express";
import { DeleteProductServices } from "../../services/product/DeleteProductServices";

class DeleteProductControllers {
  async handle(req: Request, res: Response) {
    const result = await new DeleteProductServices().execute({ id: req.params.id });
    return res.json(result);
  }
}

export { DeleteProductControllers };
