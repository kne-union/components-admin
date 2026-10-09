import * as oauth from 'oauth4webapi';
import { loadKeyPair, removeKeyPair, createProof, decodeJwtPayload } from './dpop';
import { getPublicBasePath } from '../../utils/publicUrl';

const SILENT_LOGIN_ERRORS = ['login_required', 'interaction_required', 'consent_required', 'account_selection_required'];
const RELOGIN_GUARD_MS = 10 * 1000;

const readJson = (storage, key) => {
  try {
    return JSON.parse(storage.getItem(key));
  } catch (e) {
    return null;
  }
};

const currentLocation = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

const withLock = (name, fn) => (navigator.locks ? navigator.locks.request(name, fn) : fn());

const createOidcClient = options => {
  const origin = window.location.origin;
  const appBase = `${origin}${getPublicBasePath()}`;
  const config = Object.assign(
    {
      issuer: `${origin}/oidc`,
      clientId: null,
      redirectUri: `${appBase}/oidc-callback`,
      postLogoutRedirectUri: `${appBase}/`,
      resource: null,
      scope: 'openid profile offline_access api',
      dpop: false,
      storageKey: 'kne-oidc',
      refreshSkew: 30,
      extraParams: {}
    },
    options
  );
  if (!config.clientId) {
    throw new Error('createOidcClient: clientId is required');
  }

  const issuerUrl = new URL(config.issuer, origin);
  const client = { client_id: config.clientId };
  const clientAuth = oauth.None();
  const requestOptions = issuerUrl.protocol === 'http:' ? { [oauth.allowInsecureRequests]: true } : {};
  const tokenKey = `${config.storageKey}:token`;
  const txKey = `${config.storageKey}:tx`;
  const reloginKey = `${config.storageKey}:relogin-at`;
  const dpopKeyName = `${config.storageKey}:${config.clientId}`;

  let discovery = null;
  const discover = () => {
    if (!discovery) {
      discovery = oauth
        .discoveryRequest(issuerUrl, Object.assign({ algorithm: 'oidc' }, requestOptions))
        .then(response => oauth.processDiscoveryResponse(issuerUrl, response))
        .catch(e => {
          discovery = null;
          throw e;
        });
    }
    return discovery;
  };

  let tokenSet = readJson(window.localStorage, tokenKey);
  const listeners = new Set();
  const emit = () => listeners.forEach(listener => listener(tokenSet));
  const setTokenSet = next => {
    tokenSet = next;
    if (next) {
      window.localStorage.setItem(tokenKey, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(tokenKey);
    }
    emit();
  };
  window.addEventListener('storage', event => {
    if (event.key === tokenKey) {
      tokenSet = readJson(window.localStorage, tokenKey);
      emit();
    }
  });

  let dpopHandle = null;
  const getDPoP = async () => {
    if (!config.dpop) {
      return undefined;
    }
    if (!dpopHandle) {
      dpopHandle = oauth.DPoP(client, await loadKeyPair(dpopKeyName));
    }
    return dpopHandle;
  };

  const tokenRequestOptions = async () =>
    Object.assign({}, requestOptions, config.resource ? { additionalParameters: { resource: config.resource } } : {}, config.dpop ? { DPoP: await getDPoP() } : {});

  const withNonceRetry = async fn => {
    try {
      return await fn();
    } catch (e) {
      if (oauth.isDPoPNonceError(e)) {
        return fn();
      }
      throw e;
    }
  };

  const saveTokens = result => {
    const previous = tokenSet || {};
    setTokenSet({
      accessToken: result.access_token,
      tokenType: String(result.token_type || 'bearer').toLowerCase(),
      refreshToken: result.refresh_token || previous.refreshToken,
      idToken: result.id_token || previous.idToken,
      expiresAt: Date.now() + (result.expires_in || 0) * 1000,
      scope: result.scope
    });
  };

  const isExpiring = target => !target?.accessToken || target.expiresAt - config.refreshSkew * 1000 <= Date.now();

  const login = async ({ returnTo, prompt, tenantId, loginHint, params } = {}) => {
    const as = await discover();
    const codeVerifier = oauth.generateRandomCodeVerifier();
    const state = oauth.generateRandomState();
    const nonce = oauth.generateRandomNonce();
    const search = Object.assign(
      {
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: config.scope,
        state,
        nonce,
        code_challenge: await oauth.calculatePKCECodeChallenge(codeVerifier),
        code_challenge_method: 'S256',
        resource: config.resource,
        prompt,
        tenant_id: tenantId,
        login_hint: loginHint
      },
      config.extraParams,
      params
    );
    if (config.dpop) {
      search.dpop_jkt = await (await getDPoP()).calculateThumbprint();
    }
    const url = new URL(as.authorization_endpoint);
    Object.entries(search).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
    window.sessionStorage.setItem(txKey, JSON.stringify({ state, nonce, codeVerifier, prompt, tenantId, returnTo: returnTo || currentLocation() }));
    window.location.assign(url.toString());
    return new Promise(() => {});
  };

  const handleCallback = async (url = window.location.href) => {
    const tx = readJson(window.sessionStorage, txKey);
    window.sessionStorage.removeItem(txKey);
    if (!tx) {
      throw new Error('login state expired');
    }
    const as = await discover();
    let params;
    try {
      params = oauth.validateAuthResponse(as, client, new URL(url), tx.state);
    } catch (e) {
      // prompt=none 静默登录失败（会话过期 / 需要交互）时回退为交互式登录
      if (e instanceof oauth.AuthorizationResponseError && tx.prompt === 'none' && SILENT_LOGIN_ERRORS.includes(e.error)) {
        return login({ returnTo: tx.returnTo, tenantId: tx.tenantId });
      }
      throw e;
    }
    const requestOptionsWithDPoP = await tokenRequestOptions();
    const result = await withNonceRetry(async () =>
      oauth.processAuthorizationCodeResponse(
        as,
        client,
        await oauth.authorizationCodeGrantRequest(as, client, clientAuth, params, config.redirectUri, tx.codeVerifier, requestOptionsWithDPoP),
        { expectedNonce: tx.nonce, requireIdToken: true }
      )
    );
    saveTokens(result);
    return { returnTo: tx.returnTo || '/' };
  };

  let refreshing = null;
  const refresh = () => {
    if (!refreshing) {
      // 多标签页共享 localStorage，用锁串行化刷新，避免 refresh token 轮换后其它标签页拿旧值换票失败
      refreshing = withLock(`${tokenKey}:refresh`, async () => {
        const latest = readJson(window.localStorage, tokenKey);
        if (latest && latest.accessToken !== tokenSet?.accessToken && !isExpiring(latest)) {
          tokenSet = latest;
          return tokenSet;
        }
        if (!tokenSet?.refreshToken) {
          throw new Error('no refresh token');
        }
        const as = await discover();
        const requestOptionsWithDPoP = await tokenRequestOptions();
        try {
          const result = await withNonceRetry(async () =>
            oauth.processRefreshTokenResponse(as, client, await oauth.refreshTokenGrantRequest(as, client, clientAuth, tokenSet.refreshToken, requestOptionsWithDPoP))
          );
          saveTokens(result);
          return tokenSet;
        } catch (e) {
          if (e instanceof oauth.ResponseBodyError && e.error === 'invalid_grant') {
            setTokenSet(null);
          }
          throw e;
        }
      }).finally(() => {
        refreshing = null;
      });
    }
    return refreshing;
  };

  const getAccessToken = async () => {
    if (!tokenSet) {
      return null;
    }
    if (!isExpiring(tokenSet)) {
      return tokenSet.accessToken;
    }
    if (!tokenSet.refreshToken) {
      return null;
    }
    try {
      return (await refresh()).accessToken;
    } catch (e) {
      return null;
    }
  };

  const isAuthenticated = () => !!tokenSet && (!isExpiring(tokenSet) || !!tokenSet.refreshToken);

  const getAuthHeaders = async ({ method = 'GET', url } = {}) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return {};
    }
    if (tokenSet.tokenType === 'dpop') {
      const keyPair = await loadKeyPair(dpopKeyName);
      return {
        Authorization: `DPoP ${accessToken}`,
        DPoP: await createProof({ keyPair, method, url, accessToken })
      };
    }
    return { Authorization: `Bearer ${accessToken}` };
  };

  const relogin = () => {
    const last = Number(window.sessionStorage.getItem(reloginKey) || 0);
    if (Date.now() - last < RELOGIN_GUARD_MS) {
      return false;
    }
    window.sessionStorage.setItem(reloginKey, String(Date.now()));
    setTokenSet(null);
    login();
    return true;
  };

  const registerInterceptors = (interceptors, { onUnauthorized } = {}) => {
    interceptors.request.use(async requestConfig => {
      const url = new URL(requestConfig.url || '', new URL(requestConfig.baseURL || '', window.location.href)).toString();
      const headers = await getAuthHeaders({ method: requestConfig.method, url });
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof requestConfig.headers?.set === 'function') {
          requestConfig.headers.set(key, value);
        } else {
          requestConfig.headers = Object.assign({}, requestConfig.headers, { [key]: value });
        }
      });
      return requestConfig;
    });
    interceptors.response.use(response => {
      if (response.status === 401 || response.data?.code === 401) {
        if (onUnauthorized ? onUnauthorized(response) !== false : relogin()) {
          response.showError = false;
        }
      }
      return response;
    });
  };

  const logout = async ({ returnTo } = {}) => {
    const idToken = tokenSet?.idToken;
    setTokenSet(null);
    if (config.dpop) {
      dpopHandle = null;
      await removeKeyPair(dpopKeyName);
    }
    const postLogoutRedirectUri = returnTo || config.postLogoutRedirectUri;
    const as = await discover().catch(() => null);
    if (!as?.end_session_endpoint) {
      window.location.assign(postLogoutRedirectUri);
      return;
    }
    const url = new URL(as.end_session_endpoint);
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri);
    if (idToken) {
      url.searchParams.set('id_token_hint', idToken);
    }
    window.location.assign(url.toString());
  };

  const switchTenant = (tenantId, { returnTo } = {}) => login({ prompt: 'none', tenantId, returnTo });

  const getClaims = () => (tokenSet?.accessToken ? decodeJwtPayload(tokenSet.accessToken) : null);

  const getIdTokenClaims = () => (tokenSet?.idToken ? decodeJwtPayload(tokenSet.idToken) : null);

  const getTenantId = () => {
    const claims = getClaims();
    if (!claims) {
      return null;
    }
    const key = Object.keys(claims).find(name => name === 'tenant_id' || name.endsWith('/tenant_id'));
    return key ? claims[key] : null;
  };

  const subscribe = listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    config,
    discover,
    login,
    handleCallback,
    refresh,
    logout,
    switchTenant,
    getAccessToken,
    getAuthHeaders,
    registerInterceptors,
    isAuthenticated,
    getTokenSet: () => tokenSet,
    getClaims,
    getIdTokenClaims,
    getTenantId,
    subscribe
  };
};

export default createOidcClient;
