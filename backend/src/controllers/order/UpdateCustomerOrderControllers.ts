import { Request, Response } from "express";
import { UpdateCustomerOrderServices } from "../../services/order/UpdateCustomerOrderServices";

class UpdateCustomerOrderControllers {
  async handle(req: Request, res: Response) {
    const result = await new UpdateCustomerOrderServices().execute({
      customerName: req.body.customerName,
      orderId: req.params.id,
      userId: req.userId,
    });
    return res.json(result);
  }
}

export { UpdateCustomerOrderControllers };
