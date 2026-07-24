const listeners = new Map();

const getKey = (type, language) => `${type || ''}::${language || ''}`;

/** 同 type/language 的分组树增删改后通知其它实例刷新（如列表页左侧 GroupFolder） */
export const notifyGroupTreeChange = (type, language, action, payload) => {
  const set = listeners.get(getKey(type, language));
  if (!set?.size) {
    return;
  }
  set.forEach(listener => {
    try {
      listener(action, payload);
    } catch (e) {
      // ignore listener errors
    }
  });
};

export const subscribeGroupTreeChange = (type, language, listener) => {
  if (typeof listener !== 'function' || !type) {
    return () => {};
  }
  const key = getKey(type, language);
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key).add(listener);
  return () => {
    const set = listeners.get(key);
    if (!set) {
      return;
    }
    set.delete(listener);
    if (set.size === 0) {
      listeners.delete(key);
    }
  };
};
