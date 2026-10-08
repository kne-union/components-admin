import { getPublicBasePath, withPublicUrl, stripPublicUrl } from './publicUrl';

describe('publicUrl', () => {
  afterEach(() => {
    delete window.runtimePublicUrl;
  });

  it('keeps paths unchanged without a mount prefix', () => {
    expect(getPublicBasePath()).toBe('');
    expect(withPublicUrl('/account/login')).toBe('/account/login');
    expect(stripPublicUrl('/tenant/home')).toBe('/tenant/home');
  });

  it('treats a root runtimePublicUrl as no prefix', () => {
    window.runtimePublicUrl = '/';
    expect(withPublicUrl('/account/login')).toBe('/account/login');
    expect(stripPublicUrl('/tenant/home')).toBe('/tenant/home');
  });

  it('prefixes full-page redirect paths once', () => {
    window.runtimePublicUrl = '/app/talent-saas';
    expect(withPublicUrl('/account/login')).toBe('/app/talent-saas/account/login');
    expect(withPublicUrl('/app/talent-saas/account/login')).toBe('/app/talent-saas/account/login');
    expect(withPublicUrl('https://example.com/login')).toBe('https://example.com/login');
  });

  it('strips the mount prefix for router navigation', () => {
    window.runtimePublicUrl = '/app/talent-saas/';
    expect(stripPublicUrl('/app/talent-saas/tenant/home')).toBe('/tenant/home');
    expect(stripPublicUrl('/app/talent-saas')).toBe('/');
    expect(stripPublicUrl('/app/talent-saas-other/x')).toBe('/app/talent-saas-other/x');
    expect(stripPublicUrl('/tenant/home')).toBe('/tenant/home');
  });
});
