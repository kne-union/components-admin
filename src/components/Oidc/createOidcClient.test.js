import * as oauth from 'oauth4webapi';
import createOidcClient from './createOidcClient';

jest.mock('oauth4webapi', () => {
  class AuthorizationResponseError extends Error {
    constructor(error) {
      super(error);
      this.error = error;
    }
  }
  class ResponseBodyError extends Error {
    constructor(error) {
      super(error);
      this.error = error;
    }
  }
  return {
    __esModule: true,
    AuthorizationResponseError,
    ResponseBodyError,
    allowInsecureRequests: Symbol('allowInsecureRequests'),
    None: () => 'none',
    DPoP: jest.fn(),
    isDPoPNonceError: () => false,
    generateRandomCodeVerifier: () => 'verifier-1',
    generateRandomState: () => 'state-1',
    generateRandomNonce: () => 'nonce-1',
    calculatePKCECodeChallenge: async () => 'challenge-1',
    discoveryRequest: jest.fn(),
    processDiscoveryResponse: jest.fn(),
    validateAuthResponse: jest.fn(),
    authorizationCodeGrantRequest: jest.fn(),
    processAuthorizationCodeResponse: jest.fn(),
    refreshTokenGrantRequest: jest.fn(),
    processRefreshTokenResponse: jest.fn()
  };
});

const jwt = payload => `e30.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig`;

// CRA 的 jest 配置开启了 resetMocks，mock 实现需在每个用例前重新设置
const setupOauthMocks = () => {
  oauth.discoveryRequest.mockImplementation(async () => ({}));
  oauth.processDiscoveryResponse.mockImplementation(async () => ({
    issuer: 'https://idp.test/oidc',
    authorization_endpoint: 'https://idp.test/oidc/auth',
    token_endpoint: 'https://idp.test/oidc/token',
    end_session_endpoint: 'https://idp.test/oidc/session/end'
  }));
  oauth.validateAuthResponse.mockImplementation((as, client, url, expectedState) => {
    const params = url.searchParams;
    if (params.get('error')) {
      throw new oauth.AuthorizationResponseError(params.get('error'));
    }
    if (params.get('state') !== expectedState) {
      throw new Error('unexpected state');
    }
    return params;
  });
  oauth.authorizationCodeGrantRequest.mockImplementation(async () => ({}));
  oauth.processAuthorizationCodeResponse.mockImplementation(async () => ({
    access_token: jwt({ sub: '1001', 'https://hr.example.com/tenant_id': 'tenant-2' }),
    token_type: 'Bearer',
    refresh_token: 'rt-1',
    id_token: 'id-token-1',
    expires_in: 600
  }));
  oauth.refreshTokenGrantRequest.mockImplementation(async () => ({}));
  oauth.processRefreshTokenResponse.mockImplementation(async () => ({
    access_token: 'at-2',
    token_type: 'Bearer',
    refresh_token: 'rt-2',
    expires_in: 600
  }));
};

const originalLocation = window.location;
const assign = jest.fn();

const setLocation = href => {
  const url = new URL(href);
  delete window.location;
  window.location = { href: url.href, origin: url.origin, pathname: url.pathname, search: url.search, hash: url.hash, assign };
};

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

const createClient = options =>
  createOidcClient(Object.assign({ issuer: 'https://idp.test/oidc', clientId: 'hr-portal', resource: 'https://app.test/api' }, options));

describe('createOidcClient', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    assign.mockReset();
    setupOauthMocks();
    setLocation('https://app.test/dashboard?tab=1');
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  test('requires clientId', () => {
    expect(() => createOidcClient({})).toThrow('clientId');
  });

  test('isolates token storage per clientId on the same origin', () => {
    const tokenSet = { accessToken: 'host-token', expiresAt: Math.floor(Date.now() / 1000) + 3600 };
    window.localStorage.setItem('kne-oidc:hr-portal:token', JSON.stringify(tokenSet));
    expect(createClient().getTokenSet()).toEqual(tokenSet);
    expect(createClient({ clientId: 'app-child' }).getTokenSet()).toBeNull();
    expect(createClient({ storageKey: 'custom' }).getTokenSet()).toBeNull();
  });

  test('login redirects to authorization endpoint with PKCE and tenant parameters', async () => {
    const client = createClient();
    client.login({ tenantId: 'tenant-2', prompt: 'none' });
    await flush();
    const url = new URL(assign.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://idp.test/oidc/auth');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: 'hr-portal',
      redirect_uri: 'https://app.test/oidc-callback',
      response_type: 'code',
      scope: 'openid profile offline_access api',
      state: 'state-1',
      nonce: 'nonce-1',
      code_challenge: 'challenge-1',
      code_challenge_method: 'S256',
      resource: 'https://app.test/api',
      prompt: 'none',
      tenant_id: 'tenant-2'
    });
    expect(JSON.parse(window.sessionStorage.getItem('kne-oidc:hr-portal:tx'))).toMatchObject({
      state: 'state-1',
      codeVerifier: 'verifier-1',
      returnTo: '/dashboard?tab=1'
    });
  });

  test('handleCallback exchanges code, stores tokens and exposes tenant claim', async () => {
    const client = createClient();
    client.login();
    await flush();
    setLocation('https://app.test/oidc-callback?code=abc&state=state-1');
    const result = await client.handleCallback();
    expect(result).toEqual({ returnTo: '/dashboard?tab=1' });
    expect(oauth.authorizationCodeGrantRequest.mock.calls[0][5]).toBe('verifier-1');
    expect(oauth.authorizationCodeGrantRequest.mock.calls[0][6].additionalParameters).toEqual({ resource: 'https://app.test/api' });
    expect(oauth.processAuthorizationCodeResponse.mock.calls[0][3]).toEqual({ expectedNonce: 'nonce-1', requireIdToken: true });
    expect(client.isAuthenticated()).toBe(true);
    expect(client.getTenantId()).toBe('tenant-2');
    const headers = await client.getAuthHeaders({ method: 'get', url: 'https://app.test/api/me' });
    expect(headers.Authorization).toMatch(/^Bearer /);
    expect(window.sessionStorage.getItem('kne-oidc:hr-portal:tx')).toBeNull();
  });

  test('silent login failure falls back to interactive login', async () => {
    const client = createClient();
    client.switchTenant('tenant-3');
    await flush();
    setLocation('https://app.test/oidc-callback?error=login_required&state=state-1');
    client.handleCallback();
    await flush();
    expect(assign).toHaveBeenCalledTimes(2);
    const url = new URL(assign.mock.calls[1][0]);
    expect(url.searchParams.get('prompt')).toBeNull();
    expect(url.searchParams.get('tenant_id')).toBe('tenant-3');
  });

  test('refreshes expired access token once for concurrent callers', async () => {
    window.localStorage.setItem(
      'kne-oidc:hr-portal:token',
      JSON.stringify({ accessToken: 'at-1', tokenType: 'bearer', refreshToken: 'rt-1', expiresAt: Date.now() - 1000 })
    );
    const client = createClient();
    const [a, b] = await Promise.all([client.getAccessToken(), client.getAccessToken()]);
    expect(a).toBe('at-2');
    expect(b).toBe('at-2');
    expect(oauth.refreshTokenGrantRequest).toHaveBeenCalledTimes(1);
    expect(oauth.refreshTokenGrantRequest.mock.calls[0][3]).toBe('rt-1');
    expect(client.getTokenSet().refreshToken).toBe('rt-2');
  });

  test('invalid_grant on refresh clears tokens', async () => {
    oauth.processRefreshTokenResponse.mockImplementationOnce(async () => {
      throw new oauth.ResponseBodyError('invalid_grant');
    });
    window.localStorage.setItem(
      'kne-oidc:hr-portal:token',
      JSON.stringify({ accessToken: 'at-1', tokenType: 'bearer', refreshToken: 'rt-1', expiresAt: Date.now() - 1000 })
    );
    const client = createClient();
    expect(await client.getAccessToken()).toBeNull();
    expect(client.isAuthenticated()).toBe(false);
    expect(window.localStorage.getItem('kne-oidc:hr-portal:token')).toBeNull();
  });

  test('interceptors inject bearer header and re-login once on 401', async () => {
    window.localStorage.setItem(
      'kne-oidc:hr-portal:token',
      JSON.stringify({ accessToken: 'at-1', tokenType: 'bearer', refreshToken: 'rt-1', expiresAt: Date.now() + 600000 })
    );
    const client = createClient();
    const handlers = {};
    client.registerInterceptors({
      request: { use: fn => (handlers.request = fn) },
      response: { use: fn => (handlers.response = fn) }
    });
    const config = await handlers.request({ url: '/user/getUserInfo', baseURL: '/api/v1', method: 'get', headers: {} });
    expect(config.headers.Authorization).toBe('Bearer at-1');

    const first = handlers.response({ status: 200, data: { code: 401 } });
    expect(first.showError).toBe(false);
    await flush();
    expect(assign).toHaveBeenCalledTimes(1);

    const second = handlers.response({ status: 401, data: {} });
    expect(second.showError).toBeUndefined();
    await flush();
    expect(assign).toHaveBeenCalledTimes(1);
  });

  test('logout clears tokens and redirects to end_session', async () => {
    window.localStorage.setItem(
      'kne-oidc:hr-portal:token',
      JSON.stringify({ accessToken: 'at-1', tokenType: 'bearer', idToken: 'id-1', expiresAt: Date.now() + 600000 })
    );
    const client = createClient();
    await client.logout();
    const url = new URL(assign.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://idp.test/oidc/session/end');
    expect(url.searchParams.get('id_token_hint')).toBe('id-1');
    expect(url.searchParams.get('post_logout_redirect_uri')).toBe('https://app.test/');
    expect(window.localStorage.getItem('kne-oidc:hr-portal:token')).toBeNull();
  });

  test('logout is not overridden by login triggered from token cleared', async () => {
    window.localStorage.setItem(
      'kne-oidc:hr-portal:token',
      JSON.stringify({ accessToken: 'at-1', tokenType: 'bearer', idToken: 'id-1', expiresAt: Date.now() + 600000 })
    );
    const client = createClient();
    client.subscribe(() => {
      if (!client.isAuthenticated()) {
        client.login();
      }
    });
    await client.logout();
    await flush();
    expect(assign).toHaveBeenCalledTimes(1);
    expect(new URL(assign.mock.calls[0][0]).pathname).toBe('/oidc/session/end');
  });
});
