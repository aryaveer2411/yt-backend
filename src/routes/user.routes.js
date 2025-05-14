import { Router } from "express";
import {
    registerUser,
    getAllUSers,
    deleteUser,
    logOutUser,
    loginUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserMedia,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser,
);

userRouter.route("/getUsers").get(getAllUSers);
userRouter.route("/delete").delete(deleteUser);
userRouter.route("/login").post(loginUser);

//secured routes

userRouter.route("/logout").post(verifyJwt, logOutUser);
userRouter.route("/refresh-token").post(verifyJwt, refreshAccessToken);
userRouter.route("/forgot-password").post(verifyJwt, changePassword);
userRouter.route("/get-user").get(verifyJwt, getCurrentUser);
userRouter.route("/update-user").put(verifyJwt, updateAccountDetails);
userRouter.route("/update-user-media").put(
    verifyJwt,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    updateUserMedia,
);

export default userRouter;
