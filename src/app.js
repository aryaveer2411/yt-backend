import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }),
);

app.use(
    express.json({
        limit: "16kb",
    }),
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    }),
);

app.use(express.static("public"));
app.use(cookieParser());

//routes
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";

app.use("/api/v1/user", userRouter);

app.use("/api/v1/admin", adminRouter);

app.use("/api/v1/video", videoRouter);

app.use("/api/v1/subscription", subscriptionRouter);

app.use("/api/v1/tweet", tweetRouter);

app.use("/api/v1/playlist", playlistRouter);

app.use("/api/v1/like", likeRouter);

app.use("/api/v1/comment", commentRouter);

//routes declaration
export default app;
