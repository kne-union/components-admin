export const GRANT_TYPES = {
  authorizationCode: 'authorization_code',
  refreshToken: 'refresh_token',
  clientCredentials: 'client_credentials',
  tokenExchange: 'urn:ietf:params:oauth:grant-type:token-exchange'
};

const splitLines = text =>
  String(text || '')
    .split(/[\r\n,]+/)
    .map(item => item.trim())
    .filter(Boolean);

export const isConfidential = item => {
  const method = item?.metadata?.token_endpoint_auth_method;
  return method ? method !== 'none' : !!item?.hasSecret;
};

export const toFormData = item => {
  const metadata = item.metadata || {};
  return {
    clientId: item.clientId,
    clientName: item.clientName,
    clientType: isConfidential(item) ? 'confidential' : 'public',
    grantTypes: metadata.grant_types || [GRANT_TYPES.authorizationCode, GRANT_TYPES.refreshToken],
    redirectUris: (metadata.redirect_uris || []).join('\n'),
    postLogoutRedirectUris: (metadata.post_logout_redirect_uris || []).join('\n'),
    backchannelLogoutUri: metadata.backchannel_logout_uri || '',
    allowedResources: item.allowedResources || [],
    description: item.description
  };
};

/**
 * 表单值转为 fastify-oidc client 接口参数；编辑时与原 metadata 合并，保留表单未覆盖的配置项
 */
export const toPayload = (formData, previousMetadata = {}) => {
  const grantTypes = formData.grantTypes || [];
  const metadata = Object.assign({}, previousMetadata, {
    token_endpoint_auth_method: formData.clientType === 'confidential' ? 'client_secret_basic' : 'none',
    grant_types: grantTypes,
    response_types: grantTypes.includes(GRANT_TYPES.authorizationCode) ? ['code'] : [],
    redirect_uris: splitLines(formData.redirectUris),
    post_logout_redirect_uris: splitLines(formData.postLogoutRedirectUris)
  });
  if (formData.backchannelLogoutUri) {
    metadata.backchannel_logout_uri = formData.backchannelLogoutUri;
    metadata.backchannel_logout_session_required = true;
  } else {
    delete metadata.backchannel_logout_uri;
    delete metadata.backchannel_logout_session_required;
  }
  return Object.assign(
    {
      clientName: formData.clientName,
      metadata,
      allowedResources: formData.allowedResources || [],
      description: formData.description || ''
    },
    formData.clientId ? { clientId: formData.clientId } : {}
  );
};
