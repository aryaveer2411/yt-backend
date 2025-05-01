import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { deleteUser } from "../controllers/deleteUser.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser);

userRouter.route("/delete").delete(deleteUser);


export default userRouter;