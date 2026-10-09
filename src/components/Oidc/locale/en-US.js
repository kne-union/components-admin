const locale = {
  // Interaction
  OidcLoginTitle: 'Sign in',
  OidcLoginTo: 'Sign in to {clientName}',
  OidcInvalidInteraction: 'Login session expired',
  OidcInvalidInteractionDesc: 'Please go back to the application and sign in again',
  OidcMissingUid: 'Missing login session parameter',
  OidcCancelLogin: 'Cancel',
  OidcAccountNotInitialized: 'The account has not been initialized yet, please initialize it in the account center first',
  OidcAccountDisabled: 'The account has been disabled',
  OidcAccountClosed: 'The account has been closed',
  OidcSelectTenant: 'Select a tenant',
  OidcSelectTenantDesc: 'Your account belongs to multiple tenants, please select the one to sign in to',
  OidcNoTenant: 'No tenant is available for this account',
  OidcConsentTitle: 'Authorization',
  OidcConsentDesc: '{clientName} is requesting access to the following information',
  OidcConsentAllow: 'Allow',
  OidcConsentDeny: 'Deny',
  OidcScopes: 'Scopes',
  OidcCurrentAccount: 'Current account',
  OidcUnknownPrompt: 'Unsupported login step: {name}',
  // Callback
  OidcCallbackLoading: 'Completing sign in…',
  OidcCallbackFailed: 'Sign in failed',
  OidcRetryLogin: 'Sign in again',
  // OidcAuthenticate
  OidcRedirecting: 'Redirecting to sign in…',
  // TenantSwitch
  OidcSwitchTenant: 'Switch tenant',
  OidcSwitchingTenant: 'Switching tenant…',
  OidcCurrentTenant: 'Current tenant',
  // Logout
  OidcLogout: 'Sign out'
};

export default locale;
