import { protectRoute } from "../middleware/auth.js";
import express from "express";
import {
  getMessages,
  getUsersForSidebar,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/messageController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.patch("/mark/:id", protectRoute, markMessageAsSeen);
router.post("/send/:id", protectRoute, upload.single("image"), sendMessage);

export default router;
