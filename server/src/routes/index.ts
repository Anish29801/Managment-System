import { Router } from "express";
import userRoutes from "./userRoutes";
import taskRoutes from "./taskRoutes";
import subTaskRoutes from "./subTaskRoutes";
import activityRoutes from "./activityRoutes";
import searchIndexRoutes from "./searchIndexRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);
router.use("/subtasks", subTaskRoutes);
router.use("/activities", activityRoutes);
router.use("/search", searchIndexRoutes);


export default router;
