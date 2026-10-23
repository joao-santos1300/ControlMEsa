import { Request, Response } from "express";
import { ListOrderServices } from "../../services/order/ListOrderServices";

class ListOrderControllers {
  async handle(req: Request, res: Response) {
    const { status, tableId, waiterId, from, to, page, pageSize } = req.query as Record<string, string | undefined>;
    const result = await new ListOrderServices().execute({
      userId: req.userId,
      role: req.userRole,
      status,
      tableId,
      waiterId,
      from,
      to,
      page,
      pageSize,
    });
    return res.json(result);
  }
}

export { ListOrderControllers };
