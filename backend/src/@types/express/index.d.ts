declare namespace Express {
  export interface Request {
    userId: string;
    userRole: "ADMIN" | "WAITER" | "KITCHEN";
  }
}
