import express from "express";
import usersController from "./controllers/usersController.js";

const router = express.Router();

// GET routes
router.get("/allUsers", usersController.allUsers);
router.get("/userID", usersController.userByID);

// POST routes
router.post("/createUser", usersController.createUser);

// DELETE routes
router.delete("/deleteUser", usersController.deleteUserByUsername);

export default router;