import { createLogoutHandler, registerOidcClient, buildLogoutReturnTo, resetOidcClientsForTests } from './accountLogout';
import { removeToken } from '@kne/token-storage';

jest.mock('@kne/token-storage', () => ({
  removeToken: jest.fn()
}));

describe('accountLogout', () => {
  afterEach(() => {
    delete window.runtimePublicUrl;
    resetOidcClientsForTests();
    removeToken.mockClear();
    jest.restoreAllMocks();
  });

  it('buildLogoutReturnTo uses withPublicUrl for login path', () => {
    window.runtimePublicUrl = '/app/demo';
    expect(buildLogoutReturnTo({ loginUrl: '/account/login', referer: 'https://host/app' })).toBe(
      '/app/demo/account/login?referer=' + encodeURIComponent('https://host/app')
    );
  });

  it('local logout clears tokens and navigates to login', async () => {
    let href = 'https://host/client';
    delete window.location;
    window.location = {
      get href() {
        return href;
      },
      set href(value) {
        href = value;
      }
    };

    const logout = createLogoutHandler({ storeKeys: { token: 'X-User-Token' }, loginUrl: '/account/login' });
    await logout();

    expect(removeToken).toHaveBeenCalledWith('X-User-Token', undefined);
    expect(href).toMatch(/^\/account\/login\?referer=/);
  });

  it('oidc logout clears app tokens and delegates to oidc client', async () => {
    const oidcLogout = jest.fn().mockResolvedValue(undefined);
    const oidcClient = {
      isAuthenticated: () => true,
      logout: oidcLogout
    };
    registerOidcClient(oidcClient);

    const logout = createLogoutHandler({
      storeKeys: { token: 'X-User-Token' },
      loginUrl: '/account/login',
      oidcClient,
      referer: 'https://host/page'
    });
    await logout();

    expect(removeToken).toHaveBeenCalledWith('X-User-Token', undefined);
    expect(oidcLogout).toHaveBeenCalledWith();
  });

  it('uses registered oidc client when no explicit client passed', async () => {
    const oidcLogout = jest.fn().mockResolvedValue(undefined);
    registerOidcClient({
      isAuthenticated: () => true,
      logout: oidcLogout
    });

    const logout = createLogoutHandler({ storeKeys: { token: 'X-User-Token' } });
    await logout();

    expect(oidcLogout).toHaveBeenCalled();
  });
});
