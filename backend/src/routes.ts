import { Router } from "express";
import { hasRole } from "./middleware/hasRole";
import { isAuthenticated } from "./middleware/isAuthenticated";
import { AuthSessionControllers } from "./controllers/session/AuthSessionControllers";
import { CreateUserControllers } from "./controllers/user/CreateUserControllers";
import { ListUserControllers } from "./controllers/user/ListUserControllers";
import { UpdateUserControllers } from "./controllers/user/UpdateUserControllers";
import { DeleteUserControllers } from "./controllers/user/DeleteUserControllers";
import { CreateCategoryControllers } from "./controllers/category/CreateCategoryControllers";
import { ListCategoryControllers } from "./controllers/category/ListCategoryControllers";
import { UpdateCategoryControllers } from "./controllers/category/UpdateCategoryControllers";
import { DeleteCategoryControllers } from "./controllers/category/DeleteCategoryControllers";
import { CreateProductControllers } from "./controllers/product/CreateProductControllers";
import { ListProductControllers } from "./controllers/product/ListProductControllers";
import { UpdateProductControllers } from "./controllers/product/UpdateProductControllers";
import { DeleteProductControllers } from "./controllers/product/DeleteProductControllers";
import { CreateTableControllers } from "./controllers/table/CreateTableControllers";
import { ListTableControllers } from "./controllers/table/ListTableControllers";
import { UpdateTableControllers } from "./controllers/table/UpdateTableControllers";
import { DeleteTableControllers } from "./controllers/table/DeleteTableControllers";
import { CreateOrderControllers } from "./controllers/order/CreateOrderControllers";
import { AddItemOrderControllers } from "./controllers/order/AddItemOrderControllers";
import { UpdateItemOrderControllers } from "./controllers/order/UpdateItemOrderControllers";
import { RemoveItemOrderControllers } from "./controllers/order/RemoveItemOrderControllers";
import { CloseOrderControllers } from "./controllers/order/CloseOrderControllers";
import { PayItemsOrderControllers } from "./controllers/order/PayItemsOrderControllers";
import { CancelOrderControllers } from "./controllers/order/CancelOrderControllers";
import { ListOrderControllers } from "./controllers/order/ListOrderControllers";
import { ShowOrderControllers } from "./controllers/order/ShowOrderControllers";
import { UpdateCustomerOrderControllers } from "./controllers/order/UpdateCustomerOrderControllers";
import { ListMineOrderControllers } from "./controllers/order/ListMineOrderControllers";
import { ListKitchenControllers } from "./controllers/kitchen/ListKitchenControllers";
import { UpdateItemStatusKitchenControllers } from "./controllers/kitchen/UpdateItemStatusKitchenControllers";
import { TopProductsDashboardControllers } from "./controllers/dashboard/TopProductsDashboardControllers";
import { SummaryDashboardControllers } from "./controllers/dashboard/SummaryDashboardControllers";

const router = Router();

const admin = [isAuthenticated, hasRole("ADMIN")];
const waiter = [isAuthenticated, hasRole("WAITER", "ADMIN")];
const kitchen = [isAuthenticated, hasRole("KITCHEN", "ADMIN")];
const anyRole = [isAuthenticated];

// post
router.post("/session", new AuthSessionControllers().handle);
router.post("/users", ...admin, new CreateUserControllers().handle);
router.post("/categories", ...admin, new CreateCategoryControllers().handle);
router.post("/products", ...admin, new CreateProductControllers().handle);
router.post("/tables", ...admin, new CreateTableControllers().handle);
router.post("/orders", ...waiter, new CreateOrderControllers().handle);
router.post("/orders/:id/items", ...waiter, new AddItemOrderControllers().handle);

// get
router.get("/users", ...admin, new ListUserControllers().handle);
router.get("/categories", ...anyRole, new ListCategoryControllers().handle);
router.get("/products", ...anyRole, new ListProductControllers().handle);
router.get("/tables", ...anyRole, new ListTableControllers().handle);
router.get("/orders", ...waiter, new ListOrderControllers().handle);
router.get("/orders/mine", ...waiter, new ListMineOrderControllers().handle);
router.get("/orders/:id", ...waiter, new ShowOrderControllers().handle);
router.get("/kitchen/orders", ...kitchen, new ListKitchenControllers().handle);
router.get("/dashboard/top-products", ...admin, new TopProductsDashboardControllers().handle);
router.get("/dashboard/summary", ...admin, new SummaryDashboardControllers().handle);

// put
router.put("/users/:id", ...admin, new UpdateUserControllers().handle);
router.put("/categories/:id", ...admin, new UpdateCategoryControllers().handle);
router.put("/products/:id", ...admin, new UpdateProductControllers().handle);
router.put("/tables/:id", ...admin, new UpdateTableControllers().handle);
router.put("/orders/:id/items/:itemId", ...waiter, new UpdateItemOrderControllers().handle);
router.put("/orders/:id/items/:itemId/status", ...kitchen, new UpdateItemStatusKitchenControllers().handle);
router.put("/orders/:id/customer", ...waiter, new UpdateCustomerOrderControllers().handle);
router.put("/orders/:id/pay", ...waiter, new PayItemsOrderControllers().handle);
router.put("/orders/:id/close", ...waiter, new CloseOrderControllers().handle);

// delete
router.delete("/users/:id", ...admin, new DeleteUserControllers().handle);
router.delete("/categories/:id", ...admin, new DeleteCategoryControllers().handle);
router.delete("/products/:id", ...admin, new DeleteProductControllers().handle);
router.delete("/tables/:id", ...admin, new DeleteTableControllers().handle);
router.delete("/orders/:id", ...waiter, new CancelOrderControllers().handle);
router.delete("/orders/:id/items/:itemId", ...waiter, new RemoveItemOrderControllers().handle);

export { router };
