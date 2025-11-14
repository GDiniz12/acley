import express from "express";
import usersController from "./controllers/userController.js";

const router = express.Router();

// Post routes
router.post("/createUser", usersController.createUser);

// Get routes
router.get("/allUsers", usersController.allUsers);
router.get("/userById/:idParam", usersController.userById)
export default router;