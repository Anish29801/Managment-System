import { Router, Request, Response } from "express";
import { User } from "../model/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

// 🔑 JWT secret (store this in .env file for security!)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Create user (POST)
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

// ✅ Sign In (POST /login)
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed", error });
  }
});

// ✅ Get all users
router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users", error });
  }
});

// ✅ Get one user by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user", error });
  }
});

// ✅ Update entire user (PUT)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    let updateData: any = { name, email, role };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user", error });
  }
});

// ✅ Partially update user (PATCH)
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const updateData: any = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User partially updated", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to patch user", error });
  }
});

// ✅ Delete user
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: `User ${deletedUser.name} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user", error });
  }
});

export default router;
