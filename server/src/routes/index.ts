import { Router } from "express";
import userRoutes from "./userRoutes";
import taskRoutes from "./taskRoutes";
import subTaskRoutes from "./subTaskRoutes";
import activityRoutes from "./activityRoutes";
import searchIndexRoutes from "./searchIndexRoutes";

const router = Router();

router.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to the API! Server is running successfully.",
    version: "1.0.0",
    endpoints: {
      users: "/users",
      tasks: "/tasks", 
      subtasks: "/subtasks",
      activities: "/activities",
      search: "/search"
    }
  });
});

router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);
router.use("/subtasks", subTaskRoutes);
router.use("/activities", activityRoutes);
router.use("/search", searchIndexRoutes);

export default router;