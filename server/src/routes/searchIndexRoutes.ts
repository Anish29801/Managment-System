import { Router, Request, Response } from "express";
import { User } from "../model/User";
import {Task} from "../model/Task";
import {Subtask} from "../model/Subtask";

const router = Router();

// 🔍 Search across Users, Tasks, Subtasks
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Search query (q) is required" });
    }

    const regex = new RegExp(q, "i");

    const [users, tasks, subtasks] = await Promise.all([
      User.find({ name: regex }),
      Task.find({ title: regex }),
      Subtask.find({ title: regex }),
    ]);

    res.json({
      query: q,
      results: {
        users,
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
