import express from "express";
import dotenv from "dotenv";
import cardsControler from "../controllers/cardsController.js"
import matterController from "../controllers/mattersController.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.Router());

// ROTAS POST
app.post("/createCard", cardsControler.createCard);
app.post("/createMatter", matterController.createMatter);
app.post("/createCardBySubMatter", cardsControler.createCardForSubMatter);
app.post("/createSubMatter", matterController.createSubMatter);

// ROTAS GET
app.get("/allCards", cardsControler.allCards);
app.get("/cardByMatter/:matterName", cardsControler.cardByMatter);
app.get("/allMatters", matterController.allMatters);
app.get("/matterByName/:matterName", matterController.matterByName);

// ROTAS PUT
app.put("/updateCard", cardsControler.updateCard);
app.put("/updateMatter", matterController.updateMatter);
// ROTAS DELETE
app.delete("/deleteCard", cardsControler.deleteCard);
app.delete("/deleteMatter", matterController.deleteMatter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));