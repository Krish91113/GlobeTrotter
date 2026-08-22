import { createHash, randomBytes } from "node:crypto";

export const sha256 = (input: string): string =>
  createHash("sha256").update(input).digest("hex");

export const generateToken = (bytes = 32): string =>
  randomBytes(bytes).toString("hex");
