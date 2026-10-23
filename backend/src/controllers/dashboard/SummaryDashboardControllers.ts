import { Request, Response } from "express";
import { SummaryDashboardServices } from "../../services/dashboard/SummaryDashboardServices";

class SummaryDashboardControllers {
  async handle(req: Request, res: Response) {
    const result = await new SummaryDashboardServices().execute();
    return res.json(result);
  }
}

export { SummaryDashboardControllers };
