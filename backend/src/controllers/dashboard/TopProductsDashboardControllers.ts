import { Request, Response } from "express";
import { TopProductsDashboardServices } from "../../services/dashboard/TopProductsDashboardServices";

class TopProductsDashboardControllers {
  async handle(req: Request, res: Response) {
    const result = await new TopProductsDashboardServices().execute({ from: req.query.from as string | undefined, to: req.query.to as string | undefined, limit: req.query.limit as string | undefined });
    return res.json(result);
  }
}

export { TopProductsDashboardControllers };
