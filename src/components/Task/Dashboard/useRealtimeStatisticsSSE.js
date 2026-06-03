import { useEffect, useState } from 'react';
import { getToken } from '@kne/token-storage';
import { getClientIanaTimezone } from '../utils';

/** 任务实时统计 SSE：负载字段约定见 `src/components/Task/doc/api.md`「任务实时统计 SSE」。 */

const isLikelyTaskStatisticsPayload = obj =>
  obj &&
  typeof obj === 'object' &&
  !Array.isArray(obj) &&
  ('totalTasks' in obj ||
    'byStatus' in obj ||
    'hourlyTrend' in obj ||
    'hourlyTrendByStatus' in obj ||
    'byType' in obj ||
    'todayDuration' in obj ||
    'pendingByRunnerType' in obj ||
    'runnerTypeStats' in obj ||
    'waitingByRunnerType' in obj ||
    'completedToday' in obj);

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
  if (isLikelyTaskStatisticsPayload(cur)) return cur;
  if (cur.data != null && typeof cur.data === 'object' && !Array.isArray(cur.data) && isLikelyTaskStatisticsPayload(cur.data)) {
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
      onMessage: parsed => {
        const nextData = unwrapStatisticsPayload(parsed);
        if (!nextData) return;
        setRealtimeData(prev => (prev && typeof prev === 'object' ? { ...prev, ...nextData } : nextData));
        setLastUpdatedAt(Date.now());
        setIsConnected(true);
      },
      onError: () => setIsConnected(false)
    });

    return () => {
      connection?.close?.();
      setIsConnected(false);
    };
  }, [ajax, sseUrl]);

  return { realtimeData, isConnected, lastUpdatedAt };
};

export default useRealtimeStatisticsSSE;
