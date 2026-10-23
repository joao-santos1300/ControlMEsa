import { Request, Response } from "express";
import { DeleteCategoryServices } from "../../services/category/DeleteCategoryServices";

class DeleteCategoryControllers {
  async handle(req: Request, res: Response) {
    const result = await new DeleteCategoryServices().execute({ id: req.params.id });
    return res.json(result);
  }
}

export { DeleteCategoryControllers };
