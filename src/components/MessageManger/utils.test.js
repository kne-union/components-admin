import { buildMessageParams } from './utils';

describe('MessageManger utils', () => {
  test('builds bracket filter params for fastify-message records', () => {
    expect(
      buildMessageParams(
        {
          type: { value: 0, label: '邮件' },
          code: 'welcome',
          name: 'user@example.com',
          ignored: 'value'
        },
        ['type', 'code', 'name']
      )
    ).toEqual({
      'filter[type]': 0,
      'filter[code]': 'welcome',
      'filter[name]': 'user@example.com'
    });
  });

  test('keeps zero values when building template filters', () => {
    expect(
      buildMessageParams(
        {
          type: { value: 0 },
          level: { value: 0 },
          status: { value: 0 },
          code: ''
        },
        ['type', 'code', 'level', 'status']
      )
    ).toEqual({
      'filter[type]': 0,
      'filter[level]': 0,
      'filter[status]': 0
    });
  });
});
