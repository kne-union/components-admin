import { getPublicBasePath, withPublicUrl, stripPublicUrl, appUrl } from './publicUrl';

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

  it('ignores absolute CDN runtimePublicUrl', () => {
    window.runtimePublicUrl = 'https://cdn.leapin-ai.com/leapin-ai-interview-flowup/cn-staging/02f0037e';
    expect(getPublicBasePath()).toBe('');
    expect(withPublicUrl('/account/login')).toBe('/account/login');
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

describe('appUrl', () => {
  afterEach(() => {
    delete window.runtimePublicUrl;
    delete window.runtimeApiUrl;
    delete window.PUBLIC_URL;
  });

  it('builds page, absolute and router urls under a mount prefix', () => {
    window.runtimePublicUrl = '/app/questionnaire';
    expect(appUrl.basePath()).toBe('/app/questionnaire');
    expect(appUrl.routerBasename()).toBe('/app/questionnaire');
    expect(appUrl.page('/q/1B4859')).toBe('/app/questionnaire/q/1B4859');
    expect(appUrl.absolute('/q/1B4859')).toBe(`${window.location.origin}/app/questionnaire/q/1B4859`);
    expect(appUrl.absolute('https://example.com/a')).toBe('https://example.com/a');
  });

  it('has no router basename without a mount prefix', () => {
    expect(appUrl.routerBasename()).toBeUndefined();
    expect(appUrl.absolute('/q/1')).toBe(`${window.location.origin}/q/1`);
  });

  it('does not prefix api and file urls twice', () => {
    window.runtimeApiUrl = '/app/questionnaire';
    expect(appUrl.api('/api/v1/static/file/a.png')).toBe('/app/questionnaire/api/v1/static/file/a.png');
    expect(appUrl.api('/app/questionnaire/api/v1/static/file/a.png')).toBe('/app/questionnaire/api/v1/static/file/a.png');
    expect(appUrl.api('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
    expect(appUrl.api('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA');
    window.runtimeApiUrl = '/';
    expect(appUrl.api('/api/v1/x')).toBe('/api/v1/x');
    window.runtimeApiUrl = 'https://api.example.com/';
    expect(appUrl.api('/api/v1/x')).toBe('https://api.example.com/api/v1/x');
  });

  it('resolves static assets against a CDN or mount prefix', () => {
    window.runtimePublicUrl = 'https://cdn.example.com/app/1.0.0';
    expect(appUrl.basePath()).toBe('');
    expect(appUrl.asset('/logo.svg')).toBe('https://cdn.example.com/app/1.0.0/logo.svg');
    window.runtimePublicUrl = '/app/questionnaire';
    expect(appUrl.asset('/logo.svg')).toBe('/app/questionnaire/logo.svg');
    delete window.runtimePublicUrl;
    window.PUBLIC_URL = '/static-root/';
    expect(appUrl.asset('/logo.svg')).toBe('/static-root/logo.svg');
  });
});
