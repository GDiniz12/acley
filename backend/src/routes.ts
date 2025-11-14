import express from "express";
import usersController from "./controllers/userController.js";

const router = express.Router();

router.post("/createUser", usersController.createUser);

export default router;