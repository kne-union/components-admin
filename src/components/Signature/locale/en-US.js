const locale = {
  // Columns
  AppId: 'AppId',
  SecretKey: 'SecretKey',
  BelongUser: 'Belong User',
  Description: 'Description',
  LastVisitedAt: 'Last Visited At',
  Status: 'Status',
  CreatedAt: 'Created At',

  // Status values
  Enabled: 'Enabled',
  Disabled: 'Disabled',

  // Actions
  AddSecretKey: 'Add Secret Key',
  Verify: 'Verify',
  Operation: 'Operation',

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

  // Form rules
  InputNumber: 'Please enter a number'
};

export default locale;
