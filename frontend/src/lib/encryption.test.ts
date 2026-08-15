import { describe, it, expect } from 'vitest';
import { generateSaltBase64, encryptSensitive, decryptSensitive } from './encryption';

describe('Zero-Knowledge Client-Side Encryption (Web Crypto)', () => {
  it('should generate a 32-byte salt as base64 string', () => {
    const salt = generateSaltBase64();
    expect(salt).toBeDefined();
    expect(typeof salt).toBe('string');
    expect(salt.length).toBeGreaterThan(20);
  });

  it('should accurately encrypt and decrypt sensitive JSON objects roundtrip', async () => {
    const salt = generateSaltBase64();
    const password = 'SuperSecureMasterPassword123!';
    const secretData = {
      document_number: 'AB-987654321',
      account_number: '100982345678',
      emergency_code: '4829',
      unicode_notes: 'நினைவு - पासपोर्ट - 🚀 secret',
    };

    const encrypted = await encryptSensitive(secretData, password, salt);
    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toContain('AB-987654321'); // Never plaintext

    const decrypted = await decryptSensitive(encrypted, password, salt);
    expect(decrypted).toEqual(secretData);
  });

  it('should fail decryption when incorrect master password is supplied', async () => {
    const salt = generateSaltBase64();
    const password = 'CorrectPassword123!';
    const wrongPassword = 'WrongPassword456!';
    const secretData = { pin: '9999' };

    const encrypted = await encryptSensitive(secretData, password, salt);

    await expect(decryptSensitive(encrypted, wrongPassword, salt)).rejects.toThrow();
  });

  it('should return empty object on empty or null payloads', async () => {
    const salt = generateSaltBase64();
    const password = 'CorrectPassword123!';

    const emptyEncrypted = await encryptSensitive({}, password, salt);
    expect(emptyEncrypted).toBe('');

    const decryptedEmpty = await decryptSensitive('', password, salt);
    expect(decryptedEmpty).toEqual({});
  });
});
