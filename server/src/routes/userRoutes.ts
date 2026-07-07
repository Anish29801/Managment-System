import { Router, Request, Response } from "express";
import { User } from "../model/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Multer config for profile picture uploads
const uploadsDir = path.join(__dirname, "..", "..", "uploads", "profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok =
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype);
    cb(null, ok);
  },
});

// GET /users/me — return current user (protected)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.userId!;
    const user = await User.findByIdPublic(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove password from response
    const { password: _, ...safeUser } = user as any;
    res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /users/me — update name (protected)
router.patch("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    const updatedUser = await User.update(userId, { name: name.trim() });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    const { password: _, ...safeUser } = updatedUser;
    res.json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile", error });
  }
});

// POST /users/me/profile-pic — upload profile picture (protected)
router.post(
  "/me/profile-pic",
  verifyToken,
  upload.single("profilePic"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const userId = req.userId!;
      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      const updatedUser = await User.update(userId, { image: imageUrl });
      if (!updatedUser) return res.status(404).json({ message: "User not found" });

      const { password: _, ...safeUser } = updatedUser;
      res.json({
        message: "Profile picture updated",
        user: safeUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to upload profile picture", error });
    }
  }
);

// POST /users/signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const savedUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const token = jwt.sign({ id: savedUser.id, email: savedUser.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: savedUser.id, name: savedUser.name, email: savedUser.email },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ error: "Signup failed" });
  }
});

// POST /users/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed", error });
  }
});

// GET /users — list all users
router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users", error });
  }
});

// GET /users/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdPublic(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user", error });
  }
});

// PUT /users/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.update(req.params.id, updateData);
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    const { password: _, ...safeUser } = updatedUser;
    res.status(200).json({ message: "User updated successfully", user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user", error });
  }
});

// PATCH /users/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const updateData: any = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.update(req.params.id, updateData);
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    const { password: _, ...safeUser } = updatedUser;
    res.status(200).json({ message: "User partially updated", user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to patch user", error });
  }
});

// DELETE /users/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdPublic(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.delete(req.params.id);
    res.status(200).json({ message: `User ${(user as any).name} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user", error });
  }
});

export default router;
