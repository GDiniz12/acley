import express from "express";
import usersController from "./controllers/userController.js";
import notebookController from "./controllers/notebookController.js";
import matterController from "./controllers/matterController.js";
import cardsController from "./controllers/cardController.js";
import authMiddleware from "./middlewares/authMiddleware.js";

const router = express.Router();

// Post routes
router.post("/user", usersController.createUser);
router.post("/user/login", usersController.login);

router.post("/notebook", notebookController.createNotebook);

router.post("/matter", matterController.createMatter);

router.post("/card", cardsController.createCard);

// Get routes
router.get("/users", usersController.allUsers);
router.get("/user", authMiddleware, usersController.userById);

router.get("/notebook/user/", authMiddleware, notebookController.notebooksByUser);

router.get("/matter/notebook", matterController.mattersByNotebook);

router.get("/card/matter", cardsController.cardsByMatter);

// Put routes
router.put("/user", usersController.updateUser);

router.put("/notebook", notebookController.updateNotebook);

router.put("/matter", matterController.updateMatter);

router.put("/card", cardsController.updateCard);

// Delete routes
router.delete("/user", usersController.deleteUser);

router.delete("/notebook", notebookController.deleteNotebook);

router.delete("/matter", matterController.deleteMatter);

router.delete("/card", cardsController.deleteCard);

export default router;