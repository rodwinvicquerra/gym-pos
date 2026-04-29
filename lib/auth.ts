import bcrypt from 'bcryptjs';
import { sql } from '@neondatabase/serverless';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function createSession(userId: string, token: string, expiresIn: number = 7 * 24 * 60 * 60 * 1000) {
  const expiresAt = new Date(Date.now() + expiresIn);
  // Return token for client to store in cookie
  return {
    token,
    expiresAt,
    maxAge: Math.floor(expiresIn / 1000),
  };
}
