import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "oursociete-secret-key-change-in-production";

export interface UserPayload {
  id: number;
  email: string;
  name: string;
  username: string | null;
  role: string;
}

export function signToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}
