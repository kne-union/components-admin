import { Progress } from 'antd';
import React, { useEffect, useState } from 'react';

const createStore = initial => {
  let state = initial;
  const listeners = new Set();
  return {
    get: () => state,
    set: next => {
      state = Object.assign({}, state, next);
      listeners.forEach(listener => listener(state));
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
};

const useStore = store => {
  const [state, setState] = useState(store.get());
  useEffect(() => store.subscribe(setState), [store]);
  return state;
};

const ProgressTitle = ({ store }) => useStore(store).title;

const ProgressContent = ({ store }) => {
  const { content, percent } = useStore(store);
  return (
    <div>
      {content ? <div style={{ marginBottom: 12 }}>{content}</div> : null}
      <Progress percent={percent} status={percent >= 100 ? 'success' : 'active'} />
    </div>
  );
};

/**
 * 打开不可关闭的进度弹窗，返回 update / close。
 * @param {Function} modal components-core:Modal@useModal 返回的 modal
 * @param {{ title: string, content?: string }} options
 */
export const openProgressModal = (modal, { title, content }) => {
  const store = createStore({ title, content, percent: 0 });
  const instance = modal({
    title: <ProgressTitle store={store} />,
    children: <ProgressContent store={store} />,
    size: 'small',
    footer: null,
    closable: false,
    maskClosable: false,
    keyboard: false
  });

  return {
    update: ({ percent, content: nextContent, title: nextTitle } = {}) => {
      store.set({
        percent: Math.max(0, Math.min(100, Math.round(Number(percent) || 0))),
        ...(nextContent != null ? { content: nextContent } : {}),
        ...(nextTitle != null ? { title: nextTitle } : {})
      });
    },
    close: () => {
      instance.close();
    }
  };
};
