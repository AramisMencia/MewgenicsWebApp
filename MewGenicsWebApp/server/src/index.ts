import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.listen(3000, () => {
  console.log("Server en http://localhost:3000");
});