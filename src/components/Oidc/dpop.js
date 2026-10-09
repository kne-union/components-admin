const DB_NAME = 'kne-oidc';
const STORE_NAME = 'dpop-keys';

const memoryKeys = new Map();

const openDb = () =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runStore = async (mode, action) => {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const request = action(transaction.objectStore(STORE_NAME));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
};

const generateKeyPair = () => crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);

// 私钥不可导出，只能存进 IndexedDB（结构化克隆）；不可用时退化为内存，刷新页面后需重新登录换绑
export const loadKeyPair = async name => {
  if (memoryKeys.has(name)) {
    return memoryKeys.get(name);
  }
  let keyPair = await runStore('readonly', store => store.get(name)).catch(() => null);
  if (!keyPair) {
    keyPair = await generateKeyPair();
    await runStore('readwrite', store => store.put(keyPair, name)).catch(() => null);
  }
  memoryKeys.set(name, keyPair);
  return keyPair;
};

export const removeKeyPair = async name => {
  memoryKeys.delete(name);
  await runStore('readwrite', store => store.delete(name)).catch(() => null);
};

const base64url = input => {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const encodeJson = value => base64url(new TextEncoder().encode(JSON.stringify(value)));

const randomId = () => base64url(crypto.getRandomValues(new Uint8Array(16)));

/**
 * 生成访问资源服务用的 DPoP proof（RFC 9449）。token endpoint 的 proof 由 oauth4webapi 生成，二者共用同一把密钥
 */
export const createProof = async ({ keyPair, method, url, accessToken, nonce }) => {
  const { kty, crv, x, y } = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const target = new URL(url, window.location.href);
  const payload = {
    jti: randomId(),
    htm: String(method || 'GET').toUpperCase(),
    htu: `${target.origin}${target.pathname}`,
    iat: Math.floor(Date.now() / 1000)
  };
  if (accessToken) {
    payload.ath = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(accessToken)));
  }
  if (nonce) {
    payload.nonce = nonce;
  }
  const signingInput = `${encodeJson({ typ: 'dpop+jwt', alg: 'ES256', jwk: { kty, crv, x, y } })}.${encodeJson(payload)}`;
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, keyPair.privateKey, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64url(signature)}`;
};

export const decodeJwtPayload = token => {
  try {
    const segment = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(segment)
        .split('')
        .map(char => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};
