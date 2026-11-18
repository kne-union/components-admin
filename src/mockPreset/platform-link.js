const minutesAgo = minutes => new Date(Date.now() - minutes * 60 * 1000).toISOString();
const hoursAgo = hours => minutesAgo(hours * 60);

const normalizeOrigin = value => String(value || '').replace(/\/+$/, '').toLowerCase();

const createPlatformLinkMock = ({ delay }) => {
  const platforms = [
    {
      platformOrigin: 'https://talent.example.com',
      platformName: 'Talent SaaS',
      issuer: 'https://talent.example.com/oidc',
      status: 'paired',
      expiresAt: null,
      pairedAt: hoursAgo(26),
      remark: '生产主平台',
      lastAccessAt: minutesAgo(8)
    },
    {
      platformOrigin: 'https://staging-talent.example.com',
      platformName: 'Talent 预发',
      issuer: null,
      status: 'issued',
      expiresAt: hoursAgo(-12),
      pairedAt: null,
      remark: '预发联调，密钥待导入',
      lastAccessAt: null
    }
  ];

  const accessLogs = [
    {
      id: 'log-1',
      at: minutesAgo(8),
      platformOrigin: 'https://talent.example.com',
      action: 'logs.stream',
      result: 'ok',
      statusCode: 200,
      actor: 'app-on-boarding-service',
      detail: '-'
    },
    {
      id: 'log-2',
      at: minutesAgo(12),
      platformOrigin: 'https://talent.example.com',
      action: 'logs.stream',
      result: 'ok',
      statusCode: 200,
      actor: 'app-on-boarding-service',
      detail: '-'
    },
    {
      id: 'log-3',
      at: minutesAgo(18),
      platformOrigin: 'https://talent.example.com',
      action: 'logs.stream',
      result: 'ok',
      statusCode: 200,
      actor: 'app-on-boarding-service',
      detail: '-'
    },
    {
      id: 'log-4',
      at: minutesAgo(40),
      platformOrigin: 'https://talent.example.com',
      action: 'app-ops:env:read',
      result: 'ok',
      statusCode: 200,
      actor: 'admin@talent.example.com',
      detail: '读取环境变量 schema'
    },
    {
      id: 'log-5',
      at: hoursAgo(2),
      platformOrigin: 'https://talent.example.com',
      action: 'activate',
      result: 'ok',
      statusCode: 200,
      actor: 'system',
      detail: '-'
    },
    {
      id: 'log-6',
      at: hoursAgo(2),
      platformOrigin: 'https://talent.example.com',
      action: 'redeem',
      result: 'ok',
      statusCode: 200,
      actor: 'system',
      detail: '-'
    },
    {
      id: 'log-7',
      at: hoursAgo(3),
      platformOrigin: 'https://staging-talent.example.com',
      action: 'register',
      result: 'ok',
      statusCode: 200,
      actor: 'local-admin',
      detail: '-'
    },
    {
      id: 'log-8',
      at: hoursAgo(5),
      platformOrigin: 'https://talent.example.com',
      action: 'app-ops:env:read',
      result: 'error',
      statusCode: 401,
      actor: 'app-on-boarding-service',
      detail: '服务令牌无效'
    },
    {
      id: 'log-9',
      at: hoursAgo(26),
      platformOrigin: 'https://talent.example.com',
      action: 'register',
      result: 'ok',
      statusCode: 200,
      actor: 'local-admin',
      detail: '-'
    }
  ];

  const page = list => ({ pageData: list, totalCount: list.length });

  const match = (url, path) => String(url || '').includes(path);

  return {
    handleAjax: async ({ url, method, data, params } = {}) => {
      if (match(url, '/link/platforms') && String(method || 'GET').toUpperCase() === 'GET') {
        return delay(page(platforms.slice()));
      }
      if (match(url, '/link/access-logs') && String(method || 'GET').toUpperCase() === 'GET') {
        const origin = normalizeOrigin(params?.platformOrigin);
        const list = origin ? accessLogs.filter(row => normalizeOrigin(row.platformOrigin) === origin) : accessLogs.slice();
        const limit = Number(params?.limit) || 50;
        const offset = Number(params?.offset) || 0;
        return delay({ pageData: list.slice(offset, offset + limit), totalCount: list.length });
      }
      if (match(url, '/link/register') && String(method || '').toUpperCase() === 'POST') {
        const origin = String(data?.platformOrigin || '').replace(/\/+$/, '');
        if (!origin) {
          return delay({ __biz: true, code: 400, msg: 'platformOrigin required', data: null }, 200);
        }
        const existing = platforms.find(item => normalizeOrigin(item.platformOrigin) === normalizeOrigin(origin));
        const row = {
          platformOrigin: origin,
          platformName: data?.platformName || existing?.platformName || origin,
          issuer: existing?.issuer || null,
          status: 'issued',
          expiresAt: hoursAgo(-24),
          pairedAt: null,
          remark: data?.remark || existing?.remark || '',
          lastAccessAt: existing?.lastAccessAt || null
        };
        if (existing) {
          Object.assign(existing, row);
        } else {
          platforms.unshift(row);
        }
        accessLogs.unshift({
          id: `log-${Date.now()}`,
          at: new Date().toISOString(),
          platformOrigin: origin,
          action: 'register',
          result: 'ok',
          statusCode: 200,
          actor: 'local-admin',
          detail: '-'
        });
        return delay({
          installKey: `ik_mock_${btoa(origin).replace(/=+$/, '').slice(0, 24)}`,
          platformOrigin: origin,
          expiresAt: row.expiresAt
        });
      }
      if (match(url, '/link/unlink') && String(method || '').toUpperCase() === 'POST') {
        const origin = normalizeOrigin(data?.platformOrigin);
        const index = platforms.findIndex(item => normalizeOrigin(item.platformOrigin) === origin);
        if (index >= 0) {
          platforms.splice(index, 1);
        }
        accessLogs.unshift({
          id: `log-${Date.now()}`,
          at: new Date().toISOString(),
          platformOrigin: data?.platformOrigin || '',
          action: 'unlink',
          result: 'ok',
          statusCode: 200,
          actor: 'local-admin',
          detail: '-'
        });
        return delay({ ok: true });
      }
      return null;
    }
  };
};

export default createPlatformLinkMock;
