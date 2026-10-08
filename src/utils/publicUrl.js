// App-manager injects window.runtimePublicUrl as `/app/{name}` (or `/`) for sub apps mounted under a path prefix.
export const getPublicBasePath = () => {
  const raw = typeof window !== 'undefined' ? window.runtimePublicUrl : '';
  if (!raw || raw === '/') {
    return '';
  }
  return String(raw).replace(/\/+$/, '');
};

// For full-page redirects: router navigate already applies basename, window.location does not.
export const withPublicUrl = pathname => {
  const path = String(pathname || '');
  const base = getPublicBasePath();
  if (!base || !path.startsWith('/') || path === base || path.startsWith(`${base}/`)) {
    return path;
  }
  return `${base}${path}`;
};

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
