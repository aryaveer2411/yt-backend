import { Router } from "express";
import { registerUser, getAllUSers, deleteUser, logOutUser, loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
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
userRouter.route("/login").post(loginUser);

//secured routes

userRouter.route("/logout").post(verifyJwt, logOutUser);
export default userRouter;