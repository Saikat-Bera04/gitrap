import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./lib/env.js";
import { errorHandler, notFoundHandler, sendOk } from "./lib/http.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import leaderboardRouter from "./routes/leaderboard.js";
import nftRouter from "./routes/nft.js";
import scoreRouter from "./routes/score.js";
import githubRouter from "./routes/github.js";
import daoRouter from "./routes/dao.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => sendOk(res, { status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/nft", nftRouter);
app.use("/api/score", scoreRouter);
app.use("/api/github", githubRouter);
app.use("/api/dao", daoRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`gitrap backend listening on http://localhost:${env.PORT}`);
});
