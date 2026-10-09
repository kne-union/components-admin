const locale = {
  // Interaction
  OidcLoginTitle: 'Sign in',
  OidcLoginTo: 'Sign in to {clientName}',
  OidcInvalidInteraction: 'Login session expired',
  OidcInvalidInteractionDesc: 'This sign in page has expired or was already used. Please go back and sign in again.',
  OidcBackToLogin: 'Back to sign in',
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
  OidcLoginCancelled: 'Sign in cancelled',
  OidcLoginCancelledDesc: 'You cancelled this sign in. Sign in again to continue.',
  OidcCallbackFailedDesc: 'Something went wrong while signing in. Please try again.',
  OidcLoginExpired: 'Sign in expired',
  OidcLoginExpiredDesc: 'This sign in page is no longer valid. Please sign in again.',
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
