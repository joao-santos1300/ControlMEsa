import { Request, Response } from "express";
import { PayItemsOrderServices } from "../../services/order/PayItemsOrderServices";

class PayItemsOrderControllers {
  async handle(req: Request, res: Response) {
    const result = await new PayItemsOrderServices().execute({
      orderId: req.params.id,
      userId: req.userId,
      role: req.userRole,
      items: req.body.items,
    });
    return res.json(result);
  }
}

export { PayItemsOrderControllers };
