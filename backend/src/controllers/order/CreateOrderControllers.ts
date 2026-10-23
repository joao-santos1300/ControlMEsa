import { Request, Response } from "express";
import { CreateOrderServices } from "../../services/order/CreateOrderServices";

class CreateOrderControllers {
  async handle(req: Request, res: Response) {
    const result = await new CreateOrderServices().execute({ ...req.body, waiterId: req.userId });
    return res.json(result);
  }
}

export { CreateOrderControllers };
