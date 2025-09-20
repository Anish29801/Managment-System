// routes/search.ts
import { Router } from "express";
import { SearchIndex } from "../model/SearchIndex";
import { Task } from "../model/Task";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const q = req.query.q as string;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Query string required" });
    }

    // Perform MongoDB text search
    const matches = await SearchIndex.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .lean();

    // Populate real task data
    const taskIds = matches.map((m) => m.taskId).filter(Boolean);
    const tasks = await Task.find({ _id: { $in: taskIds } });

    res.json(tasks);
  } catch (err: any) {
    console.error("Search failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
