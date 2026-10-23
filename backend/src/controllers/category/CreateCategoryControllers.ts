import { Request, Response } from "express";
import { CreateCategoryServices } from "../../services/category/CreateCategoryServices";

class CreateCategoryControllers {
  async handle(req: Request, res: Response) {
    const result = await new CreateCategoryServices().execute({ ...req.body });
    return res.json(result);
  }
}

export { CreateCategoryControllers };
