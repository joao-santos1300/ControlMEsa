import { Request, Response } from "express";
import { ListMineOrderServices } from "../../services/order/ListMineOrderServices";

class ListMineOrderControllers {
  async handle(req: Request, res: Response) {
    const result = await new ListMineOrderServices().execute({ userId: req.userId });
    return res.json(result);
  }
}

export { ListMineOrderControllers };
