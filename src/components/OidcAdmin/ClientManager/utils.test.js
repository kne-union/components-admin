import { GRANT_TYPES, isConfidential, toFormData, toPayload } from './utils';

describe('OidcAdmin client utils', () => {
  test('maps public SPA form values to oidc-provider metadata', () => {
    const payload = toPayload({
      clientId: 'hr-portal',
      clientName: '人力资源门户',
      clientType: 'public',
      grantTypes: [GRANT_TYPES.authorizationCode, GRANT_TYPES.refreshToken],
      redirectUris: 'https://hr.example.com/oidc-callback\nhttps://hr.example.com/m/oidc-callback',
      postLogoutRedirectUris: 'https://hr.example.com/',
      allowedResources: ['https://hr.example.com/api']
    });
    expect(payload).toEqual({
      clientId: 'hr-portal',
      clientName: '人力资源门户',
      allowedResources: ['https://hr.example.com/api'],
      description: '',
      metadata: {
        token_endpoint_auth_method: 'none',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        redirect_uris: ['https://hr.example.com/oidc-callback', 'https://hr.example.com/m/oidc-callback'],
        post_logout_redirect_uris: ['https://hr.example.com/']
      }
    });
  });

  test('confidential service client has no response types and keeps back-channel settings', () => {
    const payload = toPayload({
      clientName: '报表服务',
      clientType: 'confidential',
      grantTypes: [GRANT_TYPES.clientCredentials],
      backchannelLogoutUri: 'https://report.example.com/api/oidc/backchannel-logout'
    });
    expect(payload.clientId).toBeUndefined();
    expect(payload.metadata).toMatchObject({
      token_endpoint_auth_method: 'client_secret_basic',
      response_types: [],
      redirect_uris: [],
      backchannel_logout_uri: 'https://report.example.com/api/oidc/backchannel-logout',
      backchannel_logout_session_required: true
    });
  });

  test('editing keeps metadata not covered by the form and removes cleared back-channel uri', () => {
    const previousMetadata = {
      application_type: 'web',
      id_token_signed_response_alg: 'RS256',
      backchannel_logout_uri: 'https://old.example.com/logout',
      backchannel_logout_session_required: true
    };
    const payload = toPayload({ clientName: 'x', clientType: 'public', grantTypes: [GRANT_TYPES.authorizationCode], backchannelLogoutUri: '' }, previousMetadata);
    expect(payload.metadata.application_type).toBe('web');
    expect(payload.metadata.id_token_signed_response_alg).toBe('RS256');
    expect(payload.metadata).not.toHaveProperty('backchannel_logout_uri');
    expect(payload.metadata).not.toHaveProperty('backchannel_logout_session_required');
  });

  test('converts client detail back to form values', () => {
    const item = {
      clientId: 'recruit-web',
      clientName: '招聘系统',
      hasSecret: false,
      metadata: {
        token_endpoint_auth_method: 'none',
        grant_types: ['authorization_code', 'refresh_token'],
        redirect_uris: ['https://a.com/cb', 'https://b.com/cb'],
        backchannel_logout_uri: 'https://a.com/logout'
      },
      allowedResources: ['https://a.com/api'],
      description: 'desc'
    };
    expect(isConfidential(item)).toBe(false);
    expect(toFormData(item)).toEqual({
      clientId: 'recruit-web',
      clientName: '招聘系统',
      clientType: 'public',
      grantTypes: ['authorization_code', 'refresh_token'],
      redirectUris: 'https://a.com/cb\nhttps://b.com/cb',
      postLogoutRedirectUris: '',
      backchannelLogoutUri: 'https://a.com/logout',
      allowedResources: ['https://a.com/api'],
      description: 'desc'
    });
  });
});
