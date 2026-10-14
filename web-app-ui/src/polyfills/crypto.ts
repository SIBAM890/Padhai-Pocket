/**
 * Node.js 'crypto' module polyfill for React Native / Expo
 * Synchronous SHA-256 implementation for deterministic seeding
 * Uses pure JavaScript (no Web Crypto API) for sync compatibility
 */

// Capture the global crypto object once, before defining our export
const globalCrypto = (globalThis as any).crypto;

// Pure JavaScript SHA-256 implementation (synchronous)
// Based on public domain implementation
function sha256(message: string | Uint8Array): Uint8Array {
  const msg = typeof message === 'string' ? new TextEncoder().encode(message) : message;
  
  // Initial hash values (first 32 bits of fractional parts of square roots of first 8 primes)
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  // Round constants (first 32 bits of fractional parts of cube roots of first 64 primes)
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  // Pre-processing: padding
  const msgLen = msg.length * 8; // message length in bits
  const paddedLen = Math.ceil((msg.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(msg);
  padded[msg.length] = 0x80;
  // Append length as 64-bit big-endian integer
  const view = new DataView(padded.buffer);
  view.setBigUint64(paddedLen - 8, BigInt(msgLen), false);

  // Process each 512-bit chunk
  for (let chunkOffset = 0; chunkOffset < paddedLen; chunkOffset += 64) {
    const w = new Uint32Array(64);
    
    // Break chunk into sixteen 32-bit big-endian words
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(chunkOffset + i * 4, false);
    }

    // Extend the sixteen 32-bit words into sixty-four 32-bit words
    for (let i = 16; i < 64; i++) {
      const s0 = (w[i - 15] >>> 7 | w[i - 15] << 25) ^ (w[i - 15] >>> 18 | w[i - 15] << 14) ^ (w[i - 15] >>> 3);
      const s1 = (w[i - 2] >>> 17 | w[i - 2] << 15) ^ (w[i - 2] >>> 19 | w[i - 2] << 13) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    // Initialize working variables
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    // Compression function main loop
    for (let i = 0; i < 64; i++) {
      const S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[i] + w[i]) >>> 0;
      const S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    // Add compressed chunk to current hash value
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  // Produce final hash as 32-byte Uint8Array
  const hash = new Uint8Array(32);
  const hashView = new DataView(hash.buffer);
  hashView.setUint32(0, h0, false);
  hashView.setUint32(4, h1, false);
  hashView.setUint32(8, h2, false);
  hashView.setUint32(12, h3, false);
  hashView.setUint32(16, h4, false);
  hashView.setUint32(20, h5, false);
  hashView.setUint32(24, h6, false);
  hashView.setUint32(28, h7, false);

  return hash;
}

class Hash {
  private algorithm: string;
  private data: Uint8Array[] = [];

  constructor(algorithm: string) {
    this.algorithm = algorithm.toUpperCase();
  }

  update(data: string | Uint8Array, encoding?: string): this {
    if (typeof data === 'string') {
      const encoder = new TextEncoder();
      this.data.push(encoder.encode(data));
    } else {
      this.data.push(data);
    }
    return this;
  }

  digest(encoding?: 'hex' | 'base64' | 'latin1'): Uint8Array | string {
    if (this.algorithm !== 'SHA-256' && this.algorithm !== 'SHA256') {
      throw new Error(`Unsupported algorithm: ${this.algorithm}. Only SHA-256 is implemented.`);
    }

    const combined = new Uint8Array(this.data.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of this.data) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    const result = sha256(combined);

    if (encoding === 'hex') {
      return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    if (encoding === 'base64') {
      return btoa(String.fromCharCode(...result));
    }
    if (encoding === 'latin1') {
      return String.fromCharCode(...result);
    }
    return result;
  }
}

function createHash(algorithm: string): Hash {
  return new Hash(algorithm);
}

function randomBytes(size: number): Uint8Array {
  const arr = new Uint8Array(size);
  if (globalCrypto && globalCrypto.getRandomValues) {
    globalCrypto.getRandomValues(arr);
  } else {
    // Fallback: Math.random (not cryptographically secure, but works for seeding)
    for (let i = 0; i < size; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return arr;
}

function randomFillSync(buffer: Uint8Array, offset = 0, size?: number): Uint8Array {
  const target = buffer.subarray(offset, offset + (size || buffer.length - offset));
  if (globalCrypto && globalCrypto.getRandomValues) {
    globalCrypto.getRandomValues(target);
  } else {
    for (let i = 0; i < target.length; i++) {
      target[i] = Math.floor(Math.random() * 256);
    }
  }
  return buffer;
}

export const crypto = {
  createHash,
  randomBytes,
  randomFillSync,
  getRandomValues: globalCrypto ? globalCrypto.getRandomValues.bind(globalCrypto) : undefined,
  subtle: globalCrypto ? globalCrypto.subtle : undefined,
};

export { createHash, randomBytes, randomFillSync };

export default crypto;