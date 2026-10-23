import { Request, Response } from "express";
import { UpdateItemOrderServices } from "../../services/order/UpdateItemOrderServices";

class UpdateItemOrderControllers {
  async handle(req: Request, res: Response) {
    const result = await new UpdateItemOrderServices().execute({ ...req.body, orderId: req.params.id, itemId: req.params.itemId, userId: req.userId });
    return res.json(result);
  }
}

export { UpdateItemOrderControllers };
