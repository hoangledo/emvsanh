import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/** Hash a password or recovery phrase. Use only in server code. */
export function hashPassword(value: string): Promise<string> {
  return bcrypt.hash(value, SALT_ROUNDS);
}

/** Compare plain value to hash. Use only in server code. */
export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
