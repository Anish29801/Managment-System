import { Router, Request, Response } from "express";
import { Task } from "../model/Task";

const router = Router();

// ✅ Create task (POST)
router.post("/task", async (req: Request, res: Response) => {
  try {
    const { title, description, status, assignedTo, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTask = new Task({
      title,
      description,
      status: status || "pending",
      assignedTo,
      dueDate
    });

    const savedTask = await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: savedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add task", error });
  }
});

// ✅ Get all tasks
router.get("/task", async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tasks", error });
  }
});

// ✅ Get one task by ID
router.get("/task/:id", async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch task", error });
  }
});

// ✅ Update task (PUT)
router.put("/task/:id", async (req: Request, res: Response) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

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
router.patch("/task/:id", async (req: Request, res: Response) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

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
router.delete("/task/:id", async (req: Request, res: Response) => {
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

export default router;
