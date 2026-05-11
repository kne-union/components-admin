import {
  buildListParams,
  buildUrlWithParams,
  filterPageData,
  formatPercent,
  formatRate,
  parseIsoDateTimeInput,
  parseJsonInput,
  parseNumberInput
} from './utils';

describe('MessageQueue utils', () => {
  test('builds flat query params from Filter values for fastify-mq list APIs', () => {
    const params = buildListParams(
      {
        topic: { value: 'order.created', label: 'order.created' },
        status: { value: { value: 'FAILED', label: 'Failed' } },
        traceId: 'trace_001',
        empty: '',
        ignored: 'ignored'
      },
      ['topic', 'status', 'traceId']
    );

    expect(params).toEqual({
      topic: 'order.created',
      status: 'FAILED',
      traceId: 'trace_001'
    });
  });

  test('keeps boolean values when building dead-letter filters', () => {
    const params = buildListParams(
      {
        replayed: { value: false, label: 'No' },
        topic: { value: 'email.send' }
      },
      ['topic', 'replayed']
    );

    expect(params).toEqual({
      topic: 'email.send',
      replayed: false
    });
  });

  test('parses JSON form input and reports invalid JSON', () => {
    expect(parseJsonInput('{"orderId":"ord_001"}', 'payload')).toEqual({ orderId: 'ord_001' });
    expect(parseJsonInput({ orderId: 'ord_002' }, 'payload')).toEqual({ orderId: 'ord_002' });
    expect(parseJsonInput('', 'meta')).toEqual({});
    expect(() => parseJsonInput('{bad json}', 'payload')).toThrow('payload');
  });

  test('parses numeric and ISO date-time form input before publishing', () => {
    expect(parseNumberInput('3', 'maxRetries')).toBe(3);
    expect(parseNumberInput('', 'priority', 0)).toBe(0);
    expect(() => parseNumberInput('abc', 'priority')).toThrow('priority');
    expect(parseIsoDateTimeInput('2026-05-11T09:00:00.000Z', 'executeAt')).toBe('2026-05-11T09:00:00.000Z');
    expect(parseIsoDateTimeInput('', 'executeAt')).toBeUndefined();
    expect(() => parseIsoDateTimeInput('2026-05-11', 'executeAt')).toThrow('executeAt');
  });

  test('filters and paginates mock page data', () => {
    const result = filterPageData({
      pageData: [{ topic: 'a' }, { topic: 'a' }, { topic: 'a' }, { topic: 'b' }],
      params: { topic: 'a', currentPage: 2, perPage: 2 },
      filters: {
        topic: (item, value) => item.topic === value
      }
    });

    expect(result).toEqual({
      pageData: [{ topic: 'a' }],
      totalCount: 3
    });
  });

  test('formats rate and percent values for dashboard display', () => {
    expect(formatRate(1.23456)).toBe('1.23');
    expect(formatPercent(0.9632)).toBe('96.32%');
    expect(formatPercent(null)).toBe('-');
  });

  test('builds dashboard SSE url with query params', () => {
    expect(buildUrlWithParams('/api/v1/mq/dashboard/sse', { interval: 1000, window: 300000 })).toBe('/api/v1/mq/dashboard/sse?interval=1000&window=300000');
    expect(buildUrlWithParams('/api/v1/mq/dashboard/sse?foo=bar', { interval: 1000 })).toBe('/api/v1/mq/dashboard/sse?foo=bar&interval=1000');
  });
});
