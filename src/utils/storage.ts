export const storage = {
  get: async <T>(key: string): Promise<T | undefined> => {
    return new Promise(resolve => {
      chrome.storage.sync.get([key], result => {
        resolve(result[key] as T);
      });
    });
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    return new Promise(resolve => {
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  },

  remove: async (key: string): Promise<void> => {
    return new Promise(resolve => {
      chrome.storage.sync.remove(key, () => {
        resolve();
      });
    });
  },

  clear: async (): Promise<void> => {
    return new Promise(resolve => {
      chrome.storage.sync.clear(() => {
        resolve();
      });
    });
  },
};
