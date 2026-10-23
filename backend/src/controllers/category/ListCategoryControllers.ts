import { Request, Response } from "express";
import { ListCategoryServices } from "../../services/category/ListCategoryServices";

class ListCategoryControllers {
  async handle(req: Request, res: Response) {
    const result = await new ListCategoryServices().execute();
    return res.json(result);
  }
}

export { ListCategoryControllers };
