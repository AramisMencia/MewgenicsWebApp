import express from "express";
import cors from "cors";
import catsRouter from "./routes/cats";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/cats", catsRouter);

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.listen(3000, () => {
  console.log("Server corriendo en http://localhost:3000");
});