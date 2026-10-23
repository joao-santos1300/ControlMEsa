import { Request, Response } from "express";
import { ListTableServices } from "../../services/table/ListTableServices";

class ListTableControllers {
  async handle(req: Request, res: Response) {
    const result = await new ListTableServices().execute();
    return res.json(result);
  }
}

export { ListTableControllers };
