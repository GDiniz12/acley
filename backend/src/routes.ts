import express from "express";
import usersController from "./controllers/userController.js";
import notebookController from "./controllers/notebookController.js";
import matterController from "./controllers/matterController.js";
import subMatterController from "./controllers/subMatterController.js";
import cardsController from "./controllers/cardController.js";
import authMiddleware from "./middlewares/authMiddleware.js";

const router = express.Router();

// Post routes
router.post("/user", usersController.createUser);
router.post("/user/login", usersController.login);

router.post("/notebook", notebookController.createNotebook);

router.post("/matter", matterController.createMatter);

router.post("/submatter", subMatterController.createSubMatter);

router.post("/card", cardsController.createCard);

// Get routes
router.get("/users", usersController.allUsers);
router.get("/user", authMiddleware, usersController.userById);

router.get("/notebook/user/", authMiddleware, notebookController.notebooksByUser);
router.get("/notebook/:id", notebookController.notebookById);

router.get("/matter/notebook/:id", matterController.mattersByNotebook);

router.get("/submatter/parent/:idParent", subMatterController.subMattersByParent);

router.get("/card/matter/:idMatter", cardsController.cardsByMatter);
router.get("/card/submatter/:idSubMatter", cardsController.cardsBySubMatter);
router.get("/card/review/:idMatter", cardsController.getAllCardsForReview);
router.get("/card/count/matter/:idMatter", cardsController.countCardsByMatter);
router.get("/card/count/submatter/:idSubMatter", cardsController.countCardsBySubMatter);

// Put routes
router.put("/user", usersController.updateUser);

router.put("/notebook/:id", notebookController.updateNotebook);

router.put("/matter", matterController.updateMatter);

router.put("/submatter", subMatterController.updateSubMatter);

router.put("/card", cardsController.updateCard);
router.put("/card/status", cardsController.updateCardStatus);

// Delete routes
router.delete("/user", usersController.deleteUser);

router.delete("/notebook/:idNotebook", notebookController.deleteNotebook);

router.delete("/matter", matterController.deleteMatter);

router.delete("/submatter", subMatterController.deleteSubMatter);

router.delete("/card", cardsController.deleteCard);

export default router;