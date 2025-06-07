import { Router } from "express";
import {
    getSubscribedChannels,
    getChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJwt);

router
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/u/:channelId").get(getChannelSubscribers);

export default router;
