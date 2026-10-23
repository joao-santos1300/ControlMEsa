import { Request, Response } from "express";
import { UpdateItemStatusKitchenServices } from "../../services/kitchen/UpdateItemStatusKitchenServices";

class UpdateItemStatusKitchenControllers {
  async handle(req: Request, res: Response) {
    const result = await new UpdateItemStatusKitchenServices().execute({ ...req.body, orderId: req.params.id, itemId: req.params.itemId });
    return res.json(result);
  }
}

export { UpdateItemStatusKitchenControllers };
