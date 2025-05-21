import { Router } from "express";
import {
    publishAVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
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
videoRouter.route("/get-video").get(getVideoById);
videoRouter
    .route("/update-video")
    .put(verifyJwt, upload.single("thumbnail"), updateVideo);
videoRouter.route("/delete-video").delete(verifyJwt, deleteVideo);

export default videoRouter;
