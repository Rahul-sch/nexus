import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// KEK (Key Encryption Key) - derived from environment secret
// In production, this should come from a proper key management system
const getKEK = (): Buffer => {
  const secret = process.env.VAULT_ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('VAULT_ENCRYPTION_SECRET must be at least 32 characters');
  }
  // Derive a 256-bit key using scrypt
  return scryptSync(secret, 'nexus-vault-salt', 32);
};

export interface EncryptedKeyData {
  encrypted_api_key: Buffer;
  api_key_iv: Buffer;
  encrypted_dek: Buffer;
  dek_iv: Buffer;
  key_hint: string;
}

export interface EncryptedKeyDataHex {
  encrypted_api_key: string;
  api_key_iv: string;
  encrypted_dek: string;
  dek_iv: string;
  key_hint: string;
}

/**
 * Encrypt an API key using envelope encryption:
 * 1. Generate a random DEK (Data Encryption Key)
 * 2. Encrypt the API key with the DEK
 * 3. Encrypt the DEK with the KEK
 */
export function encryptApiKey(apiKey: string): EncryptedKeyDataHex {
  const kek = getKEK();

  // Generate random DEK (256-bit)
  const dek = randomBytes(32);
  const apiKeyIv = randomBytes(16);
  const dekIv = randomBytes(16);

  // Encrypt API key with DEK
  const apiKeyCipher = createCipheriv('aes-256-gcm', dek, apiKeyIv);
  const encryptedApiKey = Buffer.concat([
    apiKeyCipher.update(apiKey, 'utf8'),
    apiKeyCipher.final(),
    apiKeyCipher.getAuthTag()
  ]);

  // Encrypt DEK with KEK
  const dekCipher = createCipheriv('aes-256-gcm', kek, dekIv);
  const encryptedDek = Buffer.concat([
    dekCipher.update(dek),
    dekCipher.final(),
    dekCipher.getAuthTag()
  ]);

  // Create hint (last 4 chars of API key)
  const keyHint = apiKey.slice(-4);

  return {
    encrypted_api_key: encryptedApiKey.toString('hex'),
    api_key_iv: apiKeyIv.toString('hex'),
    encrypted_dek: encryptedDek.toString('hex'),
    dek_iv: dekIv.toString('hex'),
    key_hint: keyHint
  };
}

/**
 * Decrypt an API key using envelope encryption:
 * 1. Decrypt the DEK with the KEK
 * 2. Decrypt the API key with the DEK
 */
export function decryptApiKey(data: EncryptedKeyDataHex): string {
  const kek = getKEK();

  // Convert hex strings to buffers
  const encryptedApiKey = Buffer.from(data.encrypted_api_key, 'hex');
  const apiKeyIv = Buffer.from(data.api_key_iv, 'hex');
  const encryptedDek = Buffer.from(data.encrypted_dek, 'hex');
  const dekIv = Buffer.from(data.dek_iv, 'hex');

  // Decrypt DEK with KEK
  // Auth tag is last 16 bytes
  const dekAuthTag = encryptedDek.subarray(-16);
  const dekCiphertext = encryptedDek.subarray(0, -16);

  const dekDecipher = createDecipheriv('aes-256-gcm', kek, dekIv);
  dekDecipher.setAuthTag(dekAuthTag);
  const dek = Buffer.concat([
    dekDecipher.update(dekCiphertext),
    dekDecipher.final()
  ]);

  // Decrypt API key with DEK
  const apiKeyAuthTag = encryptedApiKey.subarray(-16);
  const apiKeyCiphertext = encryptedApiKey.subarray(0, -16);

  const apiKeyDecipher = createDecipheriv('aes-256-gcm', dek, apiKeyIv);
  apiKeyDecipher.setAuthTag(apiKeyAuthTag);
  const apiKey = Buffer.concat([
    apiKeyDecipher.update(apiKeyCiphertext),
    apiKeyDecipher.final()
  ]).toString('utf8');

  return apiKey;
}

/**
 * Get all decrypted API keys for a user (for orchestration)
 */
export async function getDecryptedKeysForUser(
  userId: string,
  supabase: any
): Promise<Record<string, string>> {
  const { data: entries, error } = await supabase
    .from('vault_entries')
    .select('provider_type, encrypted_api_key, api_key_iv, encrypted_dek, dek_iv, key_hint')
    .eq('user_id', userId);

  if (error || !entries) {
    throw new Error('Failed to fetch vault entries');
  }

  const keys: Record<string, string> = {};

  for (const entry of entries) {
    try {
      keys[entry.provider_type] = decryptApiKey({
        encrypted_api_key: entry.encrypted_api_key,
        api_key_iv: entry.api_key_iv,
        encrypted_dek: entry.encrypted_dek,
        dek_iv: entry.dek_iv,
        key_hint: entry.key_hint
      });
    } catch (err) {
      console.error(`Failed to decrypt key for ${entry.provider_type}:`, err);
    }
  }

  return keys;
}
