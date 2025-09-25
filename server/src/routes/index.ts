import { Router } from "express";
import userRoutes from "./userRoutes";
import taskRoutes from "./taskRoutes";

const router = Router();

router.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to the API! Server is running successfully.",
    version: "1.0.0",
    endpoints: {
      users: "/users",
      tasks: "/tasks", 
      subtasks: "/subtasks"
    }
  });
});

router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);

export default router;