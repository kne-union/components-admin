const locale = {
  // User List columns
  Avatar: 'Avatar',
  Nickname: 'Nickname',
  Email: 'Email',
  Phone: 'Phone',
  IsSuperAdmin: 'Is Super Admin',
  SuperAdmin: 'Super Admin',
  Status: 'Status',
  Bio: 'Bio',

  // Status values
  Yes: 'Yes',
  No: 'No',
  Normal: 'Normal',
  NotActivated: 'Not Activated',
  Disabled: 'Disabled',
  Closed: 'Closed',
  Other: 'Other',

  // Actions
  AddUser: 'Add User',
  AddSuccess: 'Added successfully',
  EditUser: 'Edit User',
  EditUserInfo: 'Edit User Info',
  DeleteSuccess: 'Deleted successfully',
  SaveSuccess: 'Saved successfully',
  Action: 'Action',
  Keyword: 'Keyword',

  // FormInner labels
  UserAvatar: 'Avatar',
  UserNickname: 'Nickname',
  UserEmail: 'Email',
  UserPhone: 'Phone',

  // Reset Password
  Password: 'Password',
  RepeatPassword: 'Repeat Password',
  ResetPassword: 'Reset Password',
  ModifyPassword: 'Modify Password',
  ModifyPasswordSuccess: 'Password modified successfully',

  // More Actions
  SetSuperAdmin: 'Set Super Admin',
  CancelSuperAdmin: 'Cancel Super Admin',
  SetSuperAdminConfirm: 'Are you sure to set this account as super admin?',
  CancelSuperAdminConfirm: 'Are you sure to cancel super admin permission for this account?',
  SetNormal: 'Set Normal',
  SetNormalConfirm: 'Are you sure to set this account as normal?',
  SetNormalSuccess: 'Account has been opened',
  CloseUser: 'Close',
  CloseAccountConfirm: 'Are you sure to close this account?',
  CloseUserSuccess: 'Account has been closed',
  SetStatusSuccess: 'Set status successfully',

  // Filter labels
  FilterEmail: 'Email',
  FilterPhone: 'Phone',
  FilterStatus: 'Status',
  FilterIsAdmin: 'Is Admin',

  // Confirm
  Confirm: 'Confirm',

  // InitAdmin
  InitSystem: 'Initialize System',
  InitSystemDesc: 'On first access to the admin console, the current signed-in user must be set as the super administrator before managing users and permissions.',
  InitSystemHintOnce: 'This can only be done once — make sure you are using the right account',
  InitSystemHintUser: 'After this, the current user becomes the system super administrator',
  InitSystemHintNext: 'You will be redirected to the admin console when it succeeds',
  InitSystemPending: 'Initializing super administrator…',
  InitSystemFailed: 'Initialization failed. Please try again.',
  InitSystemRetry: 'Retry',
  InitSuccess: 'Initialized administrator successfully!',

  // AdminLayout built-in navigation
  NavUserManagement: 'User Management',
  NavFileManagement: 'File Management',
  NavMessageManagement: 'Message Management',
  NavPlatformManagement: 'Platform',
  NavAuthManagement: 'Authentication',
  NavPlatformLink: 'Platform Link',
  NavOidcClients: 'Clients',
  NavOidcResourceServers: 'Resource Servers',
  NavOidcKeys: 'Signing Keys',
  NavOidcSessions: 'Sessions',
  NavOidcApps: 'App Center'
};

export default locale;
