import { describe, it, expect, beforeEach } from '@jest/globals';
import { config, getToken } from '../index';

describe('Token Integration Tests', () => {
  beforeEach(() => {
    // Verify environment variables are set
    if (!process.env.FHIR_BASE_URL || !process.env.FHIR_CLIENT_ID || 
        !process.env.FHIR_CLIENT_SECRET || !process.env.FHIR_TOKEN_URL) {
      throw new Error(
        'Required environment variables not set. Please set: FHIR_BASE_URL, FHIR_CLIENT_ID, FHIR_CLIENT_SECRET, FHIR_TOKEN_URL'
      );
    }
  });

  it('should successfully retrieve an OAuth token from the server', async () => {
    // Get actual token from server
    const token = await getToken();

    // Verify we got a non-empty string token
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  }, 10000); // Increase timeout to 10s for real HTTP request

  it('should cache and reuse valid tokens', async () => {
    // Get first token
    const token1 = await getToken();

    // Get second token immediately after
    const token2 = await getToken();

    // Tokens should be identical since the second call should use the cache
    expect(token1).toBe(token2);
  });
}); 