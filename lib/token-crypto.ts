/**
 * Server-side only — encrypts/decrypts platform OAuth tokens using AES-256-GCM
 * with PLATFORM_TOKEN_SECRET as the key (must be 32 bytes / 64 hex chars).
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto"

const ALGORITHM = "aes-256-gcm"
const SECRET = process.env.PLATFORM_TOKEN_SECRET ?? "fallback-dev-secret-change-in-prod!!"

function getKey(): Buffer {
  return scryptSync(SECRET, "solosuccess-salt", 32)
}

export function encryptToken(data: object): Buffer {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const json = JSON.stringify(data)
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Layout: [12 iv][16 authTag][encrypted]
  return Buffer.concat([iv, authTag, encrypted])
}

export function decryptToken<T = Record<string, string>>(buf: Buffer): T {
  const key = getKey()
  const iv = buf.subarray(0, 12)
  const authTag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return JSON.parse(decrypted.toString("utf8")) as T
}
