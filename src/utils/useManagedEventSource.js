import { useEffect, useRef } from 'react';

/**
 * EventSource with explicit teardown: no browser auto-reconnect after errors,
 * and close on unmount / page hide (tab close or SPA navigation).
 */
const useManagedEventSource = (url, { enabled = true, onMessage, onOpen, onError } = {}) => {
  const handlersRef = useRef({ onMessage, onOpen, onError });
  handlersRef.current = { onMessage, onOpen, onError };

  useEffect(() => {
    if (!enabled || !url || typeof window === 'undefined' || typeof window.EventSource !== 'function') {
      return undefined;
    }

    const source = new EventSource(url);

    const closeSource = () => {
      source.onopen = null;
      source.onmessage = null;
      source.onerror = null;
      if (source.readyState !== EventSource.CLOSED) {
        source.close();
      }
    };

    source.onopen = event => {
      handlersRef.current.onOpen?.(event, source);
    };

    source.onmessage = event => {
      handlersRef.current.onMessage?.(event, source);
    };

    source.onerror = event => {
      handlersRef.current.onError?.(event, source);
      // Prevent default auto-reconnect (otherwise server sees a new SSE loop after disconnect)
      closeSource();
    };

    const onPageHide = () => closeSource();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') closeSource();
    };

    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      closeSource();
    };
  }, [url, enabled]);
};

export default useManagedEventSource;
