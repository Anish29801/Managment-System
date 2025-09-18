import { Router, Request, Response } from "express";
import { Subtask } from "../model/Subtask";

const router = Router();

// ✅ Create Subtask
router.post("/", async (req: Request, res: Response) => {
  try {
    const subtask = new Subtask(req.body);
    await subtask.save();
    res.status(201).json(subtask);
  } catch (err) {
    res.status(400).json({ error: "Failed to create subtask", details: err });
  }
});

// ✅ Get All Subtasks
router.get("/", async (_req: Request, res: Response) => {
  try {
    const subtasks = await Subtask.find().populate("taskId");
    res.json(subtasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subtasks" });
  }
});

// ✅ Get One Subtask by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const subtask = await Subtask.findById(req.params.id).populate("taskId");
    if (!subtask) return res.status(404).json({ error: "Subtask not found" });
    res.json(subtask);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subtask" });
  }
});

// ✅ Update Subtask
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const subtask = await Subtask.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subtask) return res.status(404).json({ error: "Subtask not found" });
    res.json(subtask);
  } catch (err) {
    res.status(400).json({ error: "Failed to update subtask" });
  }
});

// ✅ Delete Subtask
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const subtask = await Subtask.findByIdAndDelete(req.params.id);
    if (!subtask) return res.status(404).json({ error: "Subtask not found" });
    res.json({ message: "Subtask deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete subtask" });
  }
});

export default router;
