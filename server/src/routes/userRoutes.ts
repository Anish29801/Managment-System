import { Router, Request, Response } from "express";
import { User } from "../model/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/auth"


const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // set by verifyToken middleware
    const user = await User.findById(userId).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id, email: savedUser.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: savedUser._id, name: savedUser.name, email: savedUser.email },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    let updateData: any = { name, email, role };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    let updateData: any = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User partially updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to patch user", error });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: `User ${deletedUser.name} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error });
  }
});

export default router;
