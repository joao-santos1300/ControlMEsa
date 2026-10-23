import { Request, Response } from "express";
import { RemoveItemOrderServices } from "../../services/order/RemoveItemOrderServices";

class RemoveItemOrderControllers {
  async handle(req: Request, res: Response) {
    const result = await new RemoveItemOrderServices().execute({ orderId: req.params.id, itemId: req.params.itemId, userId: req.userId });
    return res.json(result);
  }
}

export { RemoveItemOrderControllers };
