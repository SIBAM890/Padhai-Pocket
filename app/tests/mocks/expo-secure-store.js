/**
 * Mock for expo-secure-store — in-memory store for unit tests.
 */

const secureStore = new Map();

const SecureStore = {
  setItemAsync: jest.fn().mockImplementation(async (key, value) => {
    secureStore.set(key, value);
  }),
  getItemAsync: jest.fn().mockImplementation(async (key) => {
    return secureStore.get(key) ?? null;
  }),
  deleteItemAsync: jest.fn().mockImplementation(async (key) => {
    secureStore.delete(key);
  }),
  // Test helper
  __reset: () => {
    secureStore.clear();
  },
  __setItem: (key, value) => {
    secureStore.set(key, value);
  },
  __getItem: (key) => {
    return secureStore.get(key) ?? null;
  },
};

module.exports = SecureStore;