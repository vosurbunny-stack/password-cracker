import { AnalysisResult } from '../types';

// A mock database mapping SHA-256 hashes to passwords.
const hashDb = new Map<string, string>([
  ['8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414', '123456@9'],
  ['ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'secret123'],
  ['ef92b778ba5cae3455139327397b1689313262f73400a45def52280e46069def', '123456'],
  ['5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'password'],
]);

/**
 * Adds a new hash-password pair to the mock database.
 * This is for demonstration purposes to make generated hashes findable.
 * @param hash The SHA-256 hash.
 * @param password The original password.
 */
export const addHashToDb = (hash: string, password: string): void => {
  hashDb.set(hash, password);
};

/**
 * Analyzes a given hash by looking it up in the mock database.
 * Supports matching full hashes or prefixes.
 * @param hash The input hash string to analyze.
 * @returns A promise that resolves to an AnalysisResult.
 */
export const analyzeHash = (hash: string): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!hash || hash.length < 10) {
        resolve({
          status: 'error',
          inputHash: hash,
          message: 'Please enter a valid hash (at least 10 characters).',
        });
        return;
      }
      
      let foundPassword: string | undefined;
      let fullHash: string | undefined;
      
      // Allow prefix matching to fulfill the prompt's example.
      for (const [key, value] of hashDb.entries()) {
        if (key.startsWith(hash.toLowerCase())) {
          foundPassword = value;
          fullHash = key;
          break;
        }
      }

      if (foundPassword && fullHash) {
        resolve({
          status: 'found',
          inputHash: fullHash,
          password: foundPassword,
          message: `Password found → ${foundPassword}`,
        });
      } else {
        resolve({
          status: 'not_found',
          inputHash: hash,
          message: 'Password not found',
        });
      }
    }, 500); // Simulate network delay
  });
};

/**
 * Generates an SHA-256 hash for a given password string.
 * @param password The password to hash.
 * @returns A promise that resolves to the SHA-256 hash as a hex string.
 */
export const generateHash = async (password: string): Promise<string> => {
    if (!password) return '';
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};