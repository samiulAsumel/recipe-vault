/** Constant-time comparison - a plain `===`/byte loop that returns early on the first
 * mismatch leaks how many leading bytes matched via response timing. Used for both password
 * hash comparison and session-signature comparison. */
export function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export function timingSafeEqualStrings(a: string, b: string): boolean {
  return timingSafeEqualBytes(new TextEncoder().encode(a), new TextEncoder().encode(b));
}
