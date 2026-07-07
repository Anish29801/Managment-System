import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { ITask } from "../types";

const COLLECTION = "tasks";
const firestore = () => getFirestore();

// Convert Firestore doc to ITask
const docToTask = (doc: FirebaseFirestore.DocumentSnapshot): ITask | null => {
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate?.toDate?.() ?? data.dueDate ?? undefined,
    createdBy: data.createdBy,
    subtasks: (data.subtasks || []).map((s: any, i: number) => ({
      id: s.id || `st-${i}`,
      title: s.title,
      status: s.status || "pending",
      createdAt: s.createdAt?.toDate?.() ?? s.createdAt,
      updatedAt: s.updatedAt?.toDate?.() ?? s.updatedAt,
    })),
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
  };
};

export const Task = {
  /** Create a new task */
  async create(data: Omit<ITask, "id" | "createdAt" | "updatedAt">): Promise<ITask> {
    const now = Timestamp.now();
    const docRef = firestore().collection(COLLECTION).doc();
    const subtasks = (data.subtasks || []).map((s) => ({
      id: s.id || `st-${Date.now()}`,
      title: s.title,
      status: s.status || "pending",
      createdAt: now,
      updatedAt: now,
    }));
    await docRef.set({
      title: data.title,
      description: data.description || "",
      status: data.status || "pending",
      priority: data.priority || "medium",
      dueDate: data.dueDate ? Timestamp.fromDate(new Date(data.dueDate)) : null,
      createdBy: data.createdBy,
      subtasks,
      createdAt: now,
      updatedAt: now,
    });
    return (await this.findById(docRef.id))!;
  },

  /** Find all tasks for a user with optional filters */
  async findByUser(
    userId: string,
    filters?: { search?: string; startDate?: string; endDate?: string }
  ): Promise<ITask[]> {
    let query: FirebaseFirestore.Query = firestore()
      .collection(COLLECTION)
      .where("createdBy", "==", userId);

    const { startDate, endDate, search } = filters || {};
    if (startDate) {
      query = query.where("dueDate", ">=", Timestamp.fromDate(new Date(startDate)));
    }
    if (endDate) {
      query = query.where("dueDate", "<=", Timestamp.fromDate(new Date(endDate)));
    }

    const snap = await query.get();
    let tasks = snap.docs.map(docToTask).filter(Boolean) as ITask[];

    // Client-side text search (Firestore doesn't support regex natively)
    if (search) {
      const re = new RegExp(search, "i");
      tasks = tasks.filter(
        (t) =>
          re.test(t.title) ||
          re.test(t.description || "") ||
          t.subtasks.some((s) => re.test(s.title))
      );
    }

    // Client-side sort (avoids composite index requirement)
    tasks.sort((a, b) => {
      const da = a.createdAt?.getTime?.() ?? 0;
      const db = b.createdAt?.getTime?.() ?? 0;
      return db - da; // newest first
    });

    return tasks;
  },

  /** Find a single task by ID and verify ownership */
  async findOne(_id: string, createdBy: string): Promise<ITask | null> {
    const doc = await firestore().collection(COLLECTION).doc(_id).get();
    const task = docToTask(doc);
    if (!task || task.createdBy !== createdBy) return null;
    return task;
  },

  /** Find task by ID only */
  async findById(_id: string): Promise<ITask | null> {
    const doc = await firestore().collection(COLLECTION).doc(_id).get();
    return docToTask(doc);
  },

  /** Update a task */
  async update(_id: string, createdBy: string, data: Partial<ITask>): Promise<ITask | null> {
    const task = await this.findOne(_id, createdBy);
    if (!task) return null;

    const updateData: Record<string, any> = { updatedAt: Timestamp.now() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate
        ? Timestamp.fromDate(new Date(data.dueDate))
        : null;
    }
    if (data.subtasks !== undefined) {
      updateData.subtasks = data.subtasks.map((s) => ({
        id: s.id || `st-${Date.now()}`,
        title: s.title,
        status: s.status,
        createdAt: s.createdAt ? Timestamp.fromDate(new Date(s.createdAt)) : Timestamp.now(),
        updatedAt: Timestamp.now(),
      }));
    }

    await firestore().collection(COLLECTION).doc(_id).update(updateData);
    return this.findById(_id);
  },

  /** Delete a task */
  async delete(_id: string, createdBy: string): Promise<ITask | null> {
    const task = await this.findOne(_id, createdBy);
    if (!task) return null;
    await firestore().collection(COLLECTION).doc(_id).delete();
    return task;
  },

  /** Add subtask to a task */
  async addSubtask(
    taskId: string,
    userId: string,
    subtask: { title: string; status?: string }
  ): Promise<ITask | null> {
    const task = await this.findOne(taskId, userId);
    if (!task) return null;

    const now = Timestamp.now();
    const newSubtask = {
      id: `st-${Date.now()}`,
      title: subtask.title,
      status: subtask.status || "pending",
      createdAt: now,
      updatedAt: now,
    };

    await firestore().collection(COLLECTION).doc(taskId).update({
      subtasks: FieldValue.arrayUnion(newSubtask),
      updatedAt: now,
    });

    return this.findById(taskId);
  },

  /** Update a subtask */
  async updateSubtask(
    taskId: string,
    userId: string,
    subtaskId: string,
    data: any
  ): Promise<ITask | null> {
    const task = await this.findOne(taskId, userId);
    if (!task) return null;

    const subtasks = task.subtasks.map((s) => {
      if (s.id === subtaskId) {
        return { ...s, ...data, updatedAt: new Date() };
      }
      return s;
    });

    await firestore().collection(COLLECTION).doc(taskId).update({
      subtasks,
      updatedAt: Timestamp.now(),
    });

    return this.findById(taskId);
  },

  /** Delete a subtask */
  async deleteSubtask(
    taskId: string,
    userId: string,
    subtaskId: string
  ): Promise<ITask | null> {
    const task = await this.findOne(taskId, userId);
    if (!task) return null;

    const subtasks = task.subtasks.filter((s) => s.id !== subtaskId);

    await firestore().collection(COLLECTION).doc(taskId).update({
      subtasks,
      updatedAt: Timestamp.now(),
    });

    return this.findById(taskId);
  },

  /** Get tasks by date range */
  async findByDateRange(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ITask[]> {
    return this.findByUser(userId, { startDate, endDate });
  },
};
