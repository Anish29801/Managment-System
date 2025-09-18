import { Router, Request, Response } from "express";
import { Activity } from "../model/Activity";

const router = Router();

// ✅ Create Activity
router.post("/activity", async (req: Request, res: Response) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(400).json({ error: "Failed to create activity", details: err });
  }
});

// ✅ Get All Activities
router.get("/activity", async (_req: Request, res: Response) => {
  try {
    const activities = await Activity.find()
      .populate("userId", "name email")
      .populate("taskId", "title")
      .populate("subtaskId", "title");
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// ✅ Get One Activity by ID
router.get("/activity/:id", async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate("userId", "name email")
      .populate("taskId", "title")
      .populate("subtaskId", "title");

    if (!activity) return res.status(404).json({ error: "Activity not found" });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

// ✅ Delete Activity
router.delete("/activity/:id", async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });
    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

export default router;
