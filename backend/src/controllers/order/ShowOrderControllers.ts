import { Request, Response } from "express";
import { ShowOrderServices } from "../../services/order/ShowOrderServices";

class ShowOrderControllers {
  async handle(req: Request, res: Response) {
    const result = await new ShowOrderServices().execute({
      orderId: req.params.id,
      userId: req.userId,
      role: req.userRole,
    });
    return res.json(result);
  }
}

export { ShowOrderControllers };
