import { Request, Response } from "express";
import { AddItemOrderServices } from "../../services/order/AddItemOrderServices";

class AddItemOrderControllers {
  async handle(req: Request, res: Response) {
    const result = await new AddItemOrderServices().execute({ ...req.body, orderId: req.params.id, userId: req.userId, role: req.userRole });
    return res.json(result);
  }
}

export { AddItemOrderControllers };
