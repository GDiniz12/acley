import express, { urlencoded } from "express";
import "dotenv/config";
import routes from "./routes.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(routes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));