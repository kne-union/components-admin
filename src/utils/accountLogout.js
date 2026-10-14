import { removeToken } from '@kne/token-storage';
import { withPublicUrl } from './publicUrl';

const oidcClients = new Set();

export const registerOidcClient = client => {
  if (client) {
    oidcClients.add(client);
  }
};

export const unregisterOidcClient = client => {
  if (client) {
    oidcClients.delete(client);
  }
};

/** @internal test helper */
export const resetOidcClientsForTests = () => {
  oidcClients.clear();
};

export const findActiveOidcClient = () => {
  for (const client of oidcClients) {
    if (client?.isAuthenticated?.()) {
      return client;
    }
  }
  return null;
};

export const buildLogoutReturnTo = ({ loginUrl, referer }) => {
  const href = referer ?? (typeof window !== 'undefined' ? window.location.href : '');
  return `${withPublicUrl(loginUrl)}?referer=${encodeURIComponent(href)}`;
};

export const clearAppTokens = (storeKeys, domain) => {
  Object.values(storeKeys).forEach(tokenKey => {
    removeToken(tokenKey, domain);
  });
};

export const createLogoutHandler = ({ storeKeys, domain, loginUrl = '/account/login', oidcClient, referer } = {}) => {
  return async () => {
    const returnTo = buildLogoutReturnTo({ loginUrl, referer });
    const client = oidcClient || findActiveOidcClient();

    clearAppTokens(storeKeys, domain);

    if (client?.isAuthenticated?.()) {
      await client.logout({ returnTo });
      return;
    }

    if (typeof window !== 'undefined') {
      window.location.href = returnTo;
    }
  };
};
