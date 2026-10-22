const isAbsoluteUrl = value => /^(https?:)?\/\//i.test(value) || /^(data|blob):/i.test(value);

const trimBase = value => {
  const base = String(value || '').replace(/\/+$/, '');
  return base === '/' ? '' : base;
};

// Prefix a root-relative path once; absolute urls and already-prefixed paths are returned as is.
const joinBase = (base, pathname) => {
  const path = String(pathname || '');
  if (!base || !path.startsWith('/') || isAbsoluteUrl(path) || path === base || path.startsWith(`${base}/`)) {
    return path;
  }
  return `${base}${path}`;
};

// App-manager injects window.runtimePublicUrl as `/app/{name}` (or `/`) for sub apps mounted under a path prefix.
export const getPublicBasePath = () => {
  const raw = typeof window !== 'undefined' ? window.runtimePublicUrl : '';
  if (!raw || raw === '/') {
    return '';
  }
  const base = String(raw).replace(/\/+$/, '');
  // runtimePublicUrl 为 CDN 静态资源根（http(s)）时，不是 SPA 挂载前缀
  if (/^https?:\/\//i.test(base)) {
    return '';
  }
  return base;
};

// For full-page redirects: router navigate already applies basename, window.location does not.
export const withPublicUrl = pathname => joinBase(getPublicBasePath(), pathname);

// For router navigate: drop the mount prefix so basename is not applied twice.
export const stripPublicUrl = pathname => {
  const path = String(pathname || '');
  const base = getPublicBasePath();
  if (!base) {
    return path;
  }
  if (path === base) {
    return '/';
  }
  return path.startsWith(`${base}/`) ? path.slice(base.length) : path;
};

// 静态资源根：runtimePublicUrl 可能是 CDN 绝对地址；未注入时用业务 preset 设置的 window.PUBLIC_URL。
const getAssetBase = () => trimBase(typeof window !== 'undefined' ? window.runtimePublicUrl || window.PUBLIC_URL : '');

// 接口根：App Manager 注入 window.runtimeApiUrl（如 `/app/{name}`），也可能是独立的 http(s) 域名。
const getApiBase = () => trimBase(typeof window !== 'undefined' ? window.runtimeApiUrl : '');

export const appUrl = {
  basePath: getPublicBasePath,
  page: withPublicUrl,
  strip: stripPublicUrl,
  absolute: pathname => {
    const path = withPublicUrl(pathname);
    return isAbsoluteUrl(path) ? path : `${window.location.origin}${path}`;
  },
  routerBasename: () => getPublicBasePath() || undefined,
  asset: pathname => joinBase(getAssetBase(), pathname),
  apiBase: getApiBase,
  api: pathname => joinBase(getApiBase(), pathname)
};
