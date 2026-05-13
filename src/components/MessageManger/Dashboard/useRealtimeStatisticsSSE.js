import { useEffect, useState } from 'react';
import { getToken } from '@kne/token-storage';
import { buildUrlWithParams } from './constants';
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

const useRealtimeStatisticsSSE = sseUrl => {
  const [realtimeData, setRealtimeData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  useEffect(() => {
    if (!sseUrl || typeof window === 'undefined' || typeof window.EventSource !== 'function') {
      return undefined;
    }

    const source = new EventSource(
      buildUrlWithParams(sseUrl, {
        interval: 5,
        token: getToken('X-User-Token'),
        timezone: getClientIanaTimezone()
      })
    );

    source.onopen = () => setIsConnected(true);
    source.onmessage = event => {
      try {
        const parsed = JSON.parse(event.data);
        const nextData = unwrapStatisticsPayload(parsed);
        if (!nextData) return;
        setRealtimeData(prev => (prev && typeof prev === 'object' ? { ...prev, ...nextData } : nextData));
        setLastUpdatedAt(Date.now());
        setIsConnected(true);
      } catch {
        // ignore parse errors
      }
    };
    source.onerror = () => setIsConnected(false);

    return () => {
      source.close();
    };
  }, [sseUrl]);

  return { realtimeData, isConnected, lastUpdatedAt };
};

export default useRealtimeStatisticsSSE;
