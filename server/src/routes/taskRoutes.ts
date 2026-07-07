import { Router, Request, Response } from "express";
import { Task } from "../model/Task";
import { verifyToken } from "../middleware/auth";

const router = Router();

/* ------------------- Create Task ------------------- */
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { title, description, status, dueDate, subtasks } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const newTask = await Task.create({
      title,
      description,
      status: status || "pending",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      subtasks: subtasks || [],
      createdBy: req.userId!,
    });

    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add task", error });
  }
});

/* ------------------- Get Current User's Tasks ------------------- */
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { search, startDate, endDate } = req.query;
    const userId = req.userId!;

    const tasks = await Task.findByUser(userId, {
      search: search as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tasks", error });
  }
});

/* ------------------- Get Single Task ------------------- */
router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const task = await Task.findOne(req.params.id, req.userId!);

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch task", error });
  }
});

/* ------------------- Update Task ------------------- */
router.put("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const updatedTask = await Task.update(req.params.id, req.userId!, req.body);

    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update task", error });
  }
});

/* ------------------- Partially Update Task ------------------- */
router.patch("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const updatedTask = await Task.update(req.params.id, req.userId!, req.body);

    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task partially updated", task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to patch task", error });
  }
});

/* ------------------- Delete Task ------------------- */
router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const deletedTask = await Task.delete(req.params.id, req.userId!);

    if (!deletedTask)
      return res.status(404).json({ message: "Task not found" });

    res.status(200).json({
      message: `Task "${deletedTask.title}" deleted successfully`,
      task: deletedTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete task", error });
  }
});

/* ------------------- Get Tasks by Date Range ------------------- */
router.get("/date-range/list", verifyToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId!;

    if (!startDate && !endDate)
      return res.status(400).json({ message: "Please provide at least one date" });

    const tasks = await Task.findByDateRange(
      userId,
      startDate as string | undefined,
      endDate as string | undefined
    );

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tasks by date range", error });
  }
});

/* ------------------- Subtask Routes ------------------- */

// Add subtask
router.post("/:id/subtasks", verifyToken, async (req: Request, res: Response) => {
  try {
    const { title, status } = req.body;
    if (!title) return res.status(400).json({ message: "Subtask title is required" });

    const task = await Task.addSubtask(req.params.id, req.userId!, { title, status });

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(201).json({ message: "Subtask added successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add subtask", error });
  }
});

// Update subtask
router.patch("/:id/subtasks/:subtaskId", verifyToken, async (req: Request, res: Response) => {
  try {
    const task = await Task.updateSubtask(req.params.id, req.userId!, req.params.subtaskId, req.body);

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Subtask updated successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update subtask", error });
  }
});

// Delete subtask
router.delete("/:id/subtasks/:subtaskId", verifyToken, async (req: Request, res: Response) => {
  try {
    const task = await Task.deleteSubtask(req.params.id, req.userId!, req.params.subtaskId);

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Subtask deleted successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete subtask", error });
  }
});

export default router;
