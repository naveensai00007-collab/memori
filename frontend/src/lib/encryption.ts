// ==========================================
// MEMORI ZERO-KNOWLEDGE CLIENT-SIDE ENCRYPTION
// Web Crypto API (FIPS-compliant AES-GCM-256 + PBKDF2 SHA-512)
// Strict Boundary: No network calls, no React, no secrets logging
// ==========================================

export function generateSaltBase64(): string {
  const salt = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...salt));
}

export function saltFromBase64(saltBase64: string): Uint8Array {
  const binary = atob(saltBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-512',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptSensitive(
  data: Record<string, any>,
  password: string,
  saltBase64: string
): Promise<string> {
  if (!data || Object.keys(data).length === 0) {
    return '';
  }

  const salt = saltFromBase64(saltBase64);
  const key = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const jsonString = JSON.stringify(data);
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(jsonString)
  );

  const ciphertext = new Uint8Array(ciphertextBuffer);
  // Combine 12-byte IV + ciphertext into a single byte array
  const combined = new Uint8Array(iv.length + ciphertext.length);
  combined.set(iv, 0);
  combined.set(ciphertext, iv.length);

  // Convert to Base64 payload
  let binary = '';
  const len = combined.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

export async function decryptSensitive(
  encryptedBase64: string,
  password: string,
  saltBase64: string
): Promise<Record<string, any>> {
  if (!encryptedBase64 || !encryptedBase64.trim()) {
    return {};
  }

  try {
    const salt = saltFromBase64(saltBase64);
    const key = await deriveKey(password, salt);
    const binary = atob(encryptedBase64);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }

    if (combined.length < 13) {
      throw new Error('Malformed encrypted payload');
    }

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    const jsonStr = dec.decode(decryptedBuffer);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to decrypt sensitive data: invalid key or payload corrupted.');
    throw new Error('DECRYPTION_FAILED');
  }
}
