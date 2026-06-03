import { useEffect, useState } from 'react';
import { getToken } from '@kne/token-storage';
import { getClientIanaTimezone } from '../utils';

const isLikelyStatisticsPayload = obj =>
  obj &&
  typeof obj === 'object' &&
  !Array.isArray(obj) &&
  ('totalRecords' in obj ||
    'byType' in obj ||
    'hourlyTrend' in obj ||
    'hourlyTrendByType' in obj ||
    'byCode' in obj ||
    'records' in obj);

const unwrapStatisticsPayload = parsed => {
  if (parsed == null) return null;
  let cur = parsed;
  if (typeof cur === 'string') {
    try {
      cur = JSON.parse(cur);
    } catch {
      return null;
    }
  }
  if (!cur || typeof cur !== 'object') return null;
  if (isLikelyStatisticsPayload(cur)) return cur;
  if (cur.data != null && typeof cur.data === 'object' && !Array.isArray(cur.data) && isLikelyStatisticsPayload(cur.data)) {
    return cur.data;
  }
  if (typeof cur.data === 'string') {
    try {
      return unwrapStatisticsPayload(JSON.parse(cur.data));
    } catch {
      return null;
    }
  }
  return null;
};

const useRealtimeStatisticsSSE = (sseUrl, ajax) => {
  const [realtimeData, setRealtimeData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  useEffect(() => {
    if (!sseUrl || !ajax || typeof ajax.sse !== 'function') {
      setIsConnected(false);
      return undefined;
    }

    const connection = ajax.sse({
      url: sseUrl,
      params: {
        interval: 5,
        token: getToken('X-User-Token'),
        timezone: getClientIanaTimezone()
      },
      onOpen: () => setIsConnected(true),
      onError: () => setIsConnected(false),
      onMessage: parsed => {
        const nextData = unwrapStatisticsPayload(parsed);
        if (!nextData) return;
        setRealtimeData(prev => (prev && typeof prev === 'object' ? { ...prev, ...nextData } : nextData));
        setLastUpdatedAt(Date.now());
        setIsConnected(true);
      }
    });

    return () => {
      connection?.close?.();
      setIsConnected(false);
    };
  }, [ajax, sseUrl]);

  return { realtimeData, isConnected, lastUpdatedAt };
};

export default useRealtimeStatisticsSSE;
