import { Router, Request, Response } from "express";
import { Task } from "../model/Task";
import { verifyToken } from "../middleware/auth";

const router = Router();

/* ------------------- Create Task ------------------- */
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { title, description, status, dueDate, subtasks } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const newTask = new Task({
      title,
      description,
      status: status || "pending",
      dueDate,
      subtasks: subtasks || [],
      createdBy: req.userId, // ✅ link task to current user
    });

    const savedTask = await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: savedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add task", error });
  }
});

/* ------------------- Get Current User's Tasks ------------------- */
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const userId = req.userId;

    let query: any = { createdBy: userId };

    if (search && typeof search === "string") {
      const regex = new RegExp(search, "i");
      query = {
        $and: [
          { createdBy: userId },
          {
            $or: [
              { title: regex },
              { description: regex },
              { "subtasks.title": regex },
            ],
          },
        ],
      };
    }

    const tasks = await Task.find(query).populate({
      path: "createdBy",
      select: "name email",
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
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.userId,
    }).populate("createdBy", "name email");

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
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

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
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

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
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });

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
router.get("/date-range", verifyToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    if (!startDate && !endDate)
      return res.status(400).json({ message: "Please provide at least one date" });

    const dateQuery: any = { createdBy: userId };

    if (startDate && endDate) {
      dateQuery.dueDate = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    } else if (startDate) {
      dateQuery.dueDate = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      dateQuery.dueDate = { $lte: new Date(endDate as string) };
    }

    const tasks = await Task.find(dateQuery).populate({ path: "createdBy", select: "name email" });
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
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.subtasks.push({ title, status: status || "pending" });
    await task.save();

    res.status(201).json({ message: "Subtask added successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add subtask", error });
  }
});

// Update subtask
router.patch("/:id/subtasks/:subtaskId", verifyToken, async (req: Request, res: Response) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    subtask.set(req.body);
    await task.save();

    res.status(200).json({ message: "Subtask updated successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update subtask", error });
  }
});

// Delete subtask
router.delete("/:id/subtasks/:subtaskId", verifyToken, async (req: Request, res: Response) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    subtask.deleteOne();
    await task.save();

    res.status(200).json({ message: "Subtask deleted successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete subtask", error });
  }
});

export default router;
