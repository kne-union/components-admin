const locale = {
  SecretKeyManagement: 'Secret Key Management',

  // Columns
  AppId: 'AppId',
  SecretKey: 'SecretKey',
  BelongUser: 'Belong User',
  Description: 'Description',
  Scopes: 'Scopes',
  ScopesAll: 'All APIs',
  ScopesCount: '{count} APIs',
  ScopesTips: 'Leave empty to allow all Open APIs',
  ScopesPlaceholder: 'Search and select allowed Open APIs',
  EditSecretKey: 'Edit Secret Key',
  LastVisitedAt: 'Last Visited At',
  Status: 'Status',
  CreatedAt: 'Created At',

  // Filters
  Keyword: 'Keyword',
  FilterAppId: 'AppId',
  FilterStatus: 'Status',

  // Status values
  Enabled: 'Enabled',
  Disable: 'Disable',
  Disabled: 'Disabled',

  // Actions
  AddSecretKey: 'Add Secret Key',
  Verify: 'Verify',
  Action: 'Action',

  // Form labels
  VerifySecretKey: 'Verify Secret Key',
  Signature: 'Signature',
  Timestamp: 'Timestamp',
  ExpireTime: 'Expire Time',

  // Messages
  SecretKeyGenerated: 'Secret key generated successfully',
  SaveSecretKeyWarning: 'Please save the current secret key properly. You will not be able to retrieve it after closing this window. Do not disclose it.',
  VerifySuccess: 'Verify successful',
  VerifyFailed: 'Verify failed',
  OperationSuccess: 'Operation successful',
  DeleteSuccess: 'Deleted successfully',

  // Confirm messages
  DisableSecretKeyTitle: 'Friendly Reminder',
  DisableSecretKeyMessage: 'After disabling this secret key, all requests using this key will be rejected. Are you sure you want to disable this secret key?',
  EnableSecretKeyMessage: 'After enabling this secret key, it will be allowed to access requests. Are you sure you want to enable this secret key?',
  ConfirmDelete: 'Are you sure you want to delete {bizName}?',

  // Form rules
  InputNumber: 'Please enter a number',
  Close: 'Close'
};

export default locale;
