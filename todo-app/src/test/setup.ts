import "@testing-library/jest-dom/vitest";

/**
 * Node 26 removed global localStorage (needs --localstorage-file).
 * jsdom doesn't auto-provide it either. We mock it so tests
 * that rely on the todo app's localStorage persistence still pass.
 */
if (typeof globalThis.localStorage === "undefined") {
  let store: Record<string, string> = {};

  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

/**
 * Node 26 doesn't expose crypto.randomUUID in the global scope
 * when using jsdom. Mock it so the app can generate IDs in tests.
 */
if (typeof globalThis.crypto === "undefined" || !globalThis.crypto.randomUUID) {
  const cryptoPolyfill = globalThis.crypto || ({} as Crypto);
  if (!cryptoPolyfill.randomUUID) {
    let counter = 0;
    cryptoPolyfill.randomUUID = () =>
      `00000000-0000-4000-8000-${String(counter++).padStart(12, "0")}` as `${string}-${string}-${string}-${string}-${string}`;
  }
  Object.defineProperty(globalThis, "crypto", {
    value: cryptoPolyfill,
    writable: true,
    configurable: true,
  });
}
