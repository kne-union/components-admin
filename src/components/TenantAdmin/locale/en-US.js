const locale = {
  // List columns
  ID: 'ID',
  Name: 'Name',
  Status: 'Status',
  Description: 'Description',
  CreatedAt: 'Created At',
  Open: 'Open',
  Close: 'Close',
  All: 'All',

  // Actions
  AddTenant: 'Add Tenant',
  EditTenant: 'Edit Tenant',
  AddSuccess: 'Added successfully',
  RemoveTenantSuccess: 'Tenant deleted successfully',
  SetStatusSuccess: 'Set status successfully',
  Edit: 'Edit',
  Delete: 'Delete',
  Save: 'Save',
  SaveSuccess: 'Saved successfully',
  Operation: 'Operation',
  Keyword: 'Keyword',
  OpenTenantConfirm: 'Are you sure you want to open the current tenant?',
  CloseTenantConfirm: 'Are you sure you want to close the current tenant?',

  // FormInner labels
  TenantName: 'Tenant Name',
  AccountCount: 'Account Count',
  ServiceTime: 'Service Time',
  Logo: 'Logo',
  ThemeColor: 'Theme Color',
  TenantDescription: 'Description',
  Type: 'Type',
  Key: 'Key',
  Value: 'Value',
  IsSecret: 'Is Secret',

  // Custom Components
  EnvironmentVariables: 'Environment Variables',
  AddEnvironmentVariable: 'Add Environment Variable',
  AddCustomComponent: 'Add Custom Component',
  Preview: 'Preview',
  Copy: 'Copy',
  EditCustomComponent: 'Edit Custom Component',
  CopySuccess: 'Copied successfully',
  ModifySuccess: 'Modified successfully',
  DeleteSuccess: 'Deleted successfully',

  // Detail
  TenantDetail: 'Tenant Detail',
  BasicInfo: 'Basic Info',
  CompanyInfo: 'Company Info',
  OrgStructure: 'Organization Structure',
  UserList: 'User List',
  Permission: 'Permission',
  Setting: 'Settings',
  AccountManagement: 'Account Management',
  DetailInfo: 'Detail Info',
  ServiceTimeRange: 'Service Time',
  AccountCountTag: 'Account Count',

  // TabDetail
  CompanyInfoSaveSuccess: 'Company info saved successfully',
  Department: 'Department',

  // OrgLink
  OrgLinkTitle: 'Linked Organization',
  OrgLinkHint:
    'After enabling, you can sync organization data from WeCom or DingTalk. Synced organizations cannot be edited or deleted, only the department leader can be modified.',
  OrgLinkEnable: 'Enable Link',
  OrgLinkSource: 'Source',
  OrgLinkSyncInterval: 'Auto Sync Interval',
  OrgLinkTargetId: 'Target ID',
  OrgLinkTargetIdPlaceholder: 'Select a TARGET_LINKED_ environment variable',
  OrgLinkTargetIdDesc: 'Please add environment variables in "Settings" with a KEY starting with TARGET_LINKED_ to make them available here.',
  OrgLinkManualSync: 'Manual Sync',
  OrgLinkCancel: 'Cancel Link',
  OrgLinkCancelConfirm: 'Are you sure you want to cancel the link? Synced organizations will be kept but will no longer be auto-updated.',
  OrgLinkLastSyncTime: 'Last Sync Time',
  OrgLinkSaveSuccess: 'Link configuration saved successfully',
  OrgLinkCancelSuccess: 'Link cancelled successfully',
  OrgLinkSyncSuccess: 'Sync completed successfully',
  OrgSourceFrom: 'Source: {source}',
  EditOrgLeader: 'Edit Leader'
};

export default locale;
