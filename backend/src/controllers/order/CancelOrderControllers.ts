import { Request, Response } from "express";
import { CancelOrderServices } from "../../services/order/CancelOrderServices";

class CancelOrderControllers {
  async handle(req: Request, res: Response) {
    const result = await new CancelOrderServices().execute({
      orderId: req.params.id,
      userId: req.userId,
      role: req.userRole,
    });
    return res.json(result);
  }
}

export { CancelOrderControllers };
