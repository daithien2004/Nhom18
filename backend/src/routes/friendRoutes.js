import express from "express";
import auth from "../middlewares/auth.js";
import {
  acceptFriendRequest,
  cancelFriend,
  getFriends,
  getReceivedFriendRequests,
  getSentFriendRequests,
  rejectFriendRequest,
  searchAllUsers,
  searchFriends,
  sendFriendRequest,
} from "../controllers/friendController.js";
import { searchSchema } from "../schemas/friendSchemas.js";
import { validateQuery } from "../middlewares/validation.js";

const router = express.Router();

router.get("/", auth, getFriends);

router.post("/request", auth, sendFriendRequest);

router.get("/requests/sent", auth, getSentFriendRequests);

router.get("/requests/received", auth, getReceivedFriendRequests);

router.post("/requests/accept", auth, acceptFriendRequest);

router.post("/requests/reject", auth, rejectFriendRequest);

router.get("/search-all", auth, validateQuery(searchSchema), searchAllUsers);

router.get("/search-friends", auth, validateQuery(searchSchema), searchFriends);

router.post("/requests/cancel", auth, cancelFriend);

export default router;
