import { Router, Request, Response } from "express";
import { User } from "../model/User";
import bcrypt from "bcryptjs";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    const savedUser = await newUser.save();
    res.status(201).json({
      message: `User ${savedUser.name} added successfully`,
      user: savedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add user", error });
  }
});


router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users", error });
  }
});

export default router;
