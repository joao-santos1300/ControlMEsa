import { Request, Response } from "express";
import { ListKitchenServices } from "../../services/kitchen/ListKitchenServices";

class ListKitchenControllers {
  async handle(req: Request, res: Response) {
    const result = await new ListKitchenServices().execute();
    return res.json(result);
  }
}

export { ListKitchenControllers };
