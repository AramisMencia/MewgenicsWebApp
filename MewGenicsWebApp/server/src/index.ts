import express from "express";
import cors from "cors";
import catsRouter from "./routes/cats";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const limiter = rateLimit({
  windowMs: 60 * 1000, //
  max: 60, //
});

const app = express();

app.use(express.json({ limit: "1mb" }));
app.set("trust proxy", 1);
app.use(limiter);
app.use(helmet());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mewgenics-web-app.vercel.app/"
  ]
}));

app.use("/cats", catsRouter);

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.listen(3000, () => {
  console.log("Server corriendo en http://localhost:3000");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled:", err);
});
