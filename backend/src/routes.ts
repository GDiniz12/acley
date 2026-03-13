import express from "express";
import usersController from "./controllers/userController.js";
import notebookController from "./controllers/notebookController.js";
import matterController from "./controllers/matterController.js";
import subMatterController from "./controllers/subMatterController.js";
import cardsController from "./controllers/cardController.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import noteFolderController from "./controllers/notesFolderController.js";
import noteController from "./controllers/noteController.js";

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
 
// ============================================================
// ROTAS DE PASTAS DE NOTAS  (todas protegidas por authMiddleware)
// ============================================================
 
// POST
router.post("/note-folder", authMiddleware, noteFolderController.createFolder);
 
// GET
router.get("/note-folder",                  authMiddleware, noteFolderController.allFolders);   // todas (para montar árvore)
router.get("/note-folder/root",             authMiddleware, noteFolderController.rootFolders);  // apenas raiz
router.get("/note-folder/:idParent/sub",    authMiddleware, noteFolderController.subFolders);   // filhas de uma pasta
 
// PUT
router.put("/note-folder/:idFolder", authMiddleware, noteFolderController.updateFolder);
 
// DELETE
router.delete("/note-folder/:idFolder", authMiddleware, noteFolderController.deleteFolder);
 
// ============================================================
// ROTAS DE NOTAS  (todas protegidas por authMiddleware)
// ============================================================
 
// POST
router.post("/note", authMiddleware, noteController.createNote);
 
// GET
router.get("/note",                     authMiddleware, noteController.allNotes);         // todas do usuário (sem content)
router.get("/note/root",                authMiddleware, noteController.rootNotes);        // sem pasta
router.get("/note/search",              authMiddleware, noteController.searchNotes);      // ?q=termo
router.get("/note/folder/:idFolder",    authMiddleware, noteController.notesByFolder);   // por pasta
router.get("/note/:idNote",             authMiddleware, noteController.noteById);        // nota completa (com content)
 
// PUT
router.put("/note/:idNote", authMiddleware, noteController.updateNote);
 
// DELETE
router.delete("/note/:idNote", authMiddleware, noteController.deleteNote);

export default router;
