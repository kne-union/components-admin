import { useMemo, useState } from 'react';
import { getToken } from '@kne/token-storage';
import { buildUrlWithParams } from './constants';
import { getClientIanaTimezone } from '../utils';
import useManagedEventSource from '../../../utils/useManagedEventSource';

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

  const streamUrl = useMemo(() => {
    if (!sseUrl) return null;
    return buildUrlWithParams(sseUrl, {
      interval: 5,
      token: getToken('X-User-Token'),
      timezone: getClientIanaTimezone()
    });
  }, [sseUrl]);

  useManagedEventSource(streamUrl, {
    onOpen: () => setIsConnected(true),
    onError: () => setIsConnected(false),
    onMessage: event => {
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
    }
  });

  return { realtimeData, isConnected, lastUpdatedAt };
};

export default useRealtimeStatisticsSSE;
