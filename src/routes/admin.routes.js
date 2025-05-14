import Router from "express";
import { isAdmin } from "../controllers/admin.controller.js";
const adminRouter = Router();

adminRouter.route("/").get(isAdmin);

export default adminRouter;
