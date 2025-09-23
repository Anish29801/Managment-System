import { Router, Request, Response } from "express";
import { Task } from "../model/Task";
import { authMiddleware } from "../middleware/taskAuth";

const router = Router();

// ✅ Create task (POST)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, status, dueDate, createdBy, subtasks } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTask = new Task({
      title,
      description,
      status: status || "pending",
      dueDate,
      createdBy,
      subtasks: subtasks || []
    });

    const savedTask = await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: savedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add task", error });
  }
});

// ✅ Get all tasks
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate({
        path: "createdBy",
        select: "name email"
      });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tasks", error });
  }
});

// ✅ Get one task by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id).populate("createdBy", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch task", error });
  }
});

// ✅ Update entire task (PUT)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update task", error });
  }
});

// ✅ Partially update task (PATCH)
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task partially updated", task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to patch task", error });
  }
});

// ✅ Delete task
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: `Task "${deletedTask.title}" deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete task", error });
  }
});


// ✅ Add subtask to a task
router.post("/:id/subtasks", async (req: Request, res: Response) => {
  try {
    const { title, status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.subtasks.push({ title, status: status || "pending" });
    await task.save();

    res.status(201).json({ message: "Subtask added successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add subtask", error });
  }
});

// ✅ Update a subtask
router.patch("/:id/subtasks/:subtaskId", async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    subtask.set(req.body);
    await task.save();

    res.status(200).json({ message: "Subtask updated successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update subtask", error });
  }
});

// ✅ Delete a subtask
router.delete("/:id/subtasks/:subtaskId", async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    subtask.deleteOne();
    await task.save();

    res.status(200).json({ message: "Subtask deleted successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete subtask", error });
  }
});

export default router;
