import { Request, Response } from "express";
import { ListProductServices } from "../../services/product/ListProductServices";

class ListProductControllers {
  async handle(req: Request, res: Response) {
    const result = await new ListProductServices().execute({
      onlyActive: req.userRole !== "ADMIN",
      categoryId: req.query.categoryId as string | undefined,
      q: req.query.q as string | undefined,
    });
    return res.json(result);
  }
}

export { ListProductControllers };
