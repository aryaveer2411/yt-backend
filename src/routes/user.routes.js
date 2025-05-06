import { Router } from "express";
import { registerUser } from "../controllers/user/user.controller.js";
import { deleteUser } from "../controllers/user/deleteUser.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getAllUSers } from "../controllers/user/getAllUsers.controller.js";
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


userRouter.route("/getUsers").get(getAllUSers);
userRouter.route("/delete").delete(deleteUser);


export default userRouter;