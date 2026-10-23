import { Request, Response } from "express";
import { UpdateCategoryServices } from "../../services/category/UpdateCategoryServices";

class UpdateCategoryControllers {
  async handle(req: Request, res: Response) {
    const result = await new UpdateCategoryServices().execute({ ...req.body, id: req.params.id });
    return res.json(result);
  }
}

export { UpdateCategoryControllers };
