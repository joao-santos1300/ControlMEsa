import { Request, Response } from "express";
import { CloseOrderServices } from "../../services/order/CloseOrderServices";

class CloseOrderControllers {
  async handle(req: Request, res: Response) {
    const result = await new CloseOrderServices().execute({ orderId: req.params.id, userId: req.userId, role: req.userRole });
    return res.json(result);
  }
}

export { CloseOrderControllers };
