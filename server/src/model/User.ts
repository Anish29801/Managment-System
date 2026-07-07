import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { IUser } from "../types";

const COLLECTION = "users";
const firestore = () => getFirestore();

// Helper to convert Firestore doc to IUser
const docToUser = (doc: FirebaseFirestore.DocumentSnapshot): IUser | null => {
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    name: data.name,
    email: data.email,
    password: data.password,
    image: data.image,
    role: data.role,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

const docToUserPublic = (doc: FirebaseFirestore.DocumentSnapshot) => {
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    name: data.name,
    email: data.email,
    image: data.image || null,
    role: data.role,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

export const User = {
  /** Find user by email */
  async findByEmail(email: string): Promise<IUser | null> {
    const snap = await firestore()
      .collection(COLLECTION)
      .where("email", "==", email)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return docToUser(snap.docs[0]);
  },

  /** Find user by ID */
  async findById(id: string): Promise<IUser | null> {
    const doc = await firestore().collection(COLLECTION).doc(id).get();
    return docToUser(doc);
  },

  /** Create a new user */
  async create(data: Omit<IUser, "id" | "createdAt" | "updatedAt">): Promise<IUser> {
    const now = Timestamp.now();
    const docRef = firestore().collection(COLLECTION).doc();
    await docRef.set({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, ...data, createdAt: now.toDate(), updatedAt: now.toDate() };
  },

  /** Update user by ID */
  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    const updateData: any = { ...data, updatedAt: Timestamp.now() };
    delete updateData.id;
    delete updateData.createdAt;

    await firestore().collection(COLLECTION).doc(id).update(updateData);
    return this.findById(id);
  },

  /** Delete user by ID */
  async delete(id: string): Promise<boolean> {
    await firestore().collection(COLLECTION).doc(id).delete();
    return true;
  },

  /** Find all users (public — no password) */
  async findAll(): Promise<any[]> {
    const snap = await firestore().collection(COLLECTION).get();
    return snap.docs.map(docToUserPublic).filter(Boolean);
  },

  /** Find user by ID (public — no password) */
  async findByIdPublic(id: string) {
    const doc = await firestore().collection(COLLECTION).doc(id).get();
    return docToUserPublic(doc);
  },
};
