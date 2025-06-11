import express from "express";
import { addProblemToPlaylist, createPlaylist, deletePlaylist, getAllListDetails, getPlaylist, removeProblemFromPlaylist } from "../controllers/playlist.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const playlistRoutes = express.Router();

playlistRoutes.get("/", authMiddleware, getAllListDetails);

playlistRoutes.get("/:playlistId", authMiddleware, getPlaylist);

playlistRoutes.post("/create-playlist", authMiddleware, createPlaylist);

playlistRoutes.post("/:playlistId/add-problem", authMiddleware, addProblemToPlaylist);

playlistRoutes.delete("/:playlistId", authMiddleware, deletePlaylist);

playlistRoutes.delete("/:playlistId/remove-problem", authMiddleware, removeProblemFromPlaylist);




export default playlistRoutes;