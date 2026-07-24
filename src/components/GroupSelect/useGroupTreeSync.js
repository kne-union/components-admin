import { useCallback, useEffect, useRef, useState } from 'react';
import { notifyGroupTreeChange, subscribeGroupTreeChange } from './groupTreeChangeBus';

/**
 * 订阅同 type/language 的分组树变更。
 * 返回 [syncKey, emitGroupTreeChange]：
 * - syncKey：挂到 Fetch 的 key，其它实例变更时强制重新拉取
 * - emitGroupTreeChange：本实例变更后调用；同步通知其它实例，并跳过自身的 syncKey 更新
 */
const useGroupTreeSync = (type, language) => {
  const [syncKey, setSyncKey] = useState(0);
  const skipSelfRef = useRef(false);

  useEffect(() => {
    return subscribeGroupTreeChange(type, language, () => {
      if (skipSelfRef.current) {
        return;
      }
      setSyncKey(key => key + 1);
    });
  }, [type, language]);

  const emitGroupTreeChange = useCallback(
    (action, payload) => {
      skipSelfRef.current = true;
      try {
        notifyGroupTreeChange(type, language, action, payload);
      } finally {
        // 监听同步触发，通知结束后再允许接收外部变更
        skipSelfRef.current = false;
      }
    },
    [type, language]
  );

  return [syncKey, emitGroupTreeChange];
};

export default useGroupTreeSync;
