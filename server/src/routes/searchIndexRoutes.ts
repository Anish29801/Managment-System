import { Router, Request, Response } from "express";
import {Task} from "../model/Task";
import {Subtask} from "../model/Subtask";

const router = Router();

// 🔍 Search across Users, Tasks, Subtasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Search query (q) is required" });
    }

    const regex = new RegExp(q, "i");

    const [tasks, subtasks] = await Promise.all([
      Task.find({ title: regex }),
      Subtask.find({ title: regex }),
    ]);

    res.json({
      query: q,
      results: {
        tasks,
        subtasks,
        
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
