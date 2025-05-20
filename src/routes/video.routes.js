import { Router } from "express";
import {
    publishAVideo,
    getAllVideos,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const videoRouter = Router();

videoRouter.route("/upload").post(
    verifyJwt,
    upload.fields([
        { name: "videoToUpload", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo,
);

videoRouter.route("/get-all-videos").get(getAllVideos);

export default videoRouter;
