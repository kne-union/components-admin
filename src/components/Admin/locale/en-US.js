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
  InitSystemDesc:
    'On first access to the admin console, the current signed-in user must be set as the super administrator before managing users and permissions.',
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
  NavMcp: 'MCP Management',
  NavMcpSettings: 'Capabilities',
  NavMcpKeys: 'Keys',
  NavOidcClients: 'Clients',
  NavOidcResourceServers: 'Resource Servers',
  NavOidcKeys: 'Signing Keys',
  NavOidcSessions: 'Sessions',
  NavOidcApps: 'App Center',

  McpMethod: 'Method',
  McpPath: 'Path',
  McpSummary: 'Summary',
  McpScenarios: 'Scenarios',
  McpScenariosEmpty: 'Uncategorized',
  McpScenariosPlaceholder: 'Separate scenarios with commas or new lines',
  McpConfirm: 'Require confirm',
  McpEnabled: 'Enabled for MCP',
  McpOptions: 'Actions',
  McpEdit: 'Edit',
  McpSync: 'Re-sync',
  McpSyncTip: 'Reconcile with current API docs: keep existing ones, disable removed ones',
  McpSyncSuccess: 'Synced: {activeCount} active, {orphanCount} stale',
  McpEnabledSuccess: 'Enabled for MCP',
  McpDisabledSuccess: 'Disabled for MCP',
  McpSaved: 'Saved',

  McpSecretName: 'Name',
  McpCreatedAt: 'Created at',
  McpBelongUser: 'Owner',
  McpSelectUserPlaceholder: 'Select a user',
  McpSelectUserRequired: 'Please select a user first',
  McpCreateSecret: 'Generate Secret Key',
  McpDeleteSecret: 'Delete',
  McpDeleteSecretConfirm: 'Clients using this key will stop working. Delete it?',
  McpSecretCreated: 'Secret Key created',
  McpSecretOnceTips: 'The secret is shown only once. Copy and store it now.',
  McpCopyAll: 'Copy all',
  McpCopySuccess: 'Copied',
  McpInstall: 'Install MCP',
  McpInstallIntro:
    'Install MCP for the selected user in an AI client (Cursor, WorkBuddy, Claude, VS Code, Codex, etc.) to query and operate capabilities opened for that user.',
  McpInstallStep1: 'Choose a user and generate a token',
  McpInstallStep1Description: 'The token belongs to the selected user and appears in the key list, where it can be deleted anytime.',
  McpInstallIntroSelf:
    'Install MCP in an AI client (Cursor, WorkBuddy, Claude, VS Code, Codex, etc.) to query and operate the capabilities opened within your own permissions.',
  McpInstallStep1Self: 'Generate your personal token',
  McpInstallStep1SelfDescription: 'The token belongs to your account and can only access data you are allowed to see.',
  McpInstallGenerateToken: 'Generate token',
  McpInstallCopyToken: 'Copy token',
  McpSecurityTitle: 'Security notice',
  McpSecurityTip1: 'An AI client holding a token acts as the token owner, with exactly that account’s permissions.',
  McpSecurityTip2: 'A token is shown only once when generated. Store it safely; never share it, commit it to a repository, screenshot it or paste it into public docs.',
  McpSecurityTip3: 'Configure it only on devices and clients you trust; delete the key when you switch devices, leave, or stop using it.',
  McpSecurityTip4: 'If a token may have leaked, delete the key immediately — clients using it stop working at once — then generate a new one.',
  McpInstallTokenOnceTips: 'This token is shown only once and is already filled into the config below. Copy it before closing.',
  McpInstallStep2: 'Choose an AI client and add the config',
  McpInstallRunCommand: 'Run in a terminal',
  McpInstallEditFile: 'Write to the config file: ',
  McpInstallCopyConfig: 'Copy',
  McpInstallPlaceholderTips: 'YOUR_MCP_TOKEN in the config is replaced once you generate a token.',
  McpInstallStep3: 'Start using it',
  McpInstallCopyPrompt: 'Copy example prompt',
  McpInstallStep3Description:
    'Restart the client or refresh its MCP list, confirm {serverName} is connected, then chat. The agent reads the built-in guides automatically.',
  McpInstallPromptExample: 'List available MCP tools and what each one does.\n\nUse MCP to fetch one business record and summarize it for me.'
};

export default locale;
