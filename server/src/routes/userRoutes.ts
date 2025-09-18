import { Router, Request, Response } from "express";
import { User } from "../model/User";
import bcrypt from "bcryptjs";

const router = Router();

// ✅ Create user (POST)
router.post("/user", async (req: Request, res: Response) => {
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

// ✅ Get all users
router.get("/user", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users", error });
  }
});

// ✅ Get one user by ID
router.get("/user/:id", async (req: Request, res: Response) => {
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
router.put("/user/:id", async (req: Request, res: Response) => {
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
router.patch("/user/:id", async (req: Request, res: Response) => {
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
router.delete("/user/:id", async (req: Request, res: Response) => {
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
