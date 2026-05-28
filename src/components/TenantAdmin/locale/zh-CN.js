const locale = {
  // List columns
  ID: 'ID',
  Name: '名称',
  Status: '状态',
  Description: '描述',
  CreatedAt: '添加时间',
  Open: '开启',
  Close: '关闭',
  All: '全部',

  // Actions
  AddTenant: '添加租户',
  EditTenant: '编辑租户',
  AddSuccess: '添加成功',
  RemoveTenantSuccess: '删除租户成功',
  SetStatusSuccess: '设置成功',
  Edit: '编辑',
  Delete: '删除',
  Save: '保存',
  SaveSuccess: '保存成功',
  Operation: '操作',
  Keyword: '关键字',
  OpenTenantConfirm: '确定要开启当前租户吗？',
  CloseTenantConfirm: '确定要关闭当前租户吗？',

  // FormInner labels
  TenantName: '租户名称',
  AccountCount: '开通账号数量',
  ServiceTime: '服务时间',
  Logo: 'Logo',
  ThemeColor: '主题色',
  TenantDescription: '描述',
  Type: '类型',
  Key: '键',
  Value: '值',
  IsSecret: '是否密钥',

  // Custom Components
  EnvironmentVariables: '环境变量',
  AddEnvironmentVariable: '添加环境变量',
  AddCustomComponent: '添加自定义组件',
  Preview: '预览',
  Copy: '复制',
  EditCustomComponent: '编辑自定义组件',
  CopySuccess: '复制成功',
  ModifySuccess: '修改成功',
  DeleteSuccess: '删除成功',

  // Detail
  TenantDetail: '租户详情',
  BasicInfo: '基本信息',
  CompanyInfo: '公司信息',
  OrgStructure: '组织架构',
  UserList: '用户列表',
  Permission: '权限',
  Setting: '设置',
  AccountManagement: '账号管理',
  DetailInfo: '详情信息',
  ServiceTimeRange: '服务时间',
  AccountCountTag: '开通账号数',

  // TabDetail
  CompanyInfoSaveSuccess: '公司信息保存成功',
  Department: '部门',

  // OrgLink
  OrgLinkTitle: '关联组织架构',
  OrgLinkHint: '开启关联后，可从企业微信或钉钉同步组织架构数据，同步的组织不可修改和删除，仅可修改部门负责人。',
  OrgLinkEnable: '开启关联',
  OrgLinkSource: '来源',
  OrgLinkSyncInterval: '自动同步间隔',
  OrgLinkTargetId: '关联目标ID',
  OrgLinkTargetIdPlaceholder: '请选择 TARGET_LINKED_ 开头的环境变量',
  OrgLinkTargetIdDesc: '请在「设置」中添加环境变量，且 KEY 需以 TARGET_LINKED_ 开头方可在此选择。',
  OrgLinkManualSync: '手动同步',
  OrgLinkCancel: '取消关联',
  OrgLinkCancelConfirm: '确定要取消关联吗？取消后已同步的组织将保留，但不再自动同步更新。',
  OrgLinkLastSyncTime: '上次同步时间',
  OrgLinkSaveSuccess: '关联配置保存成功',
  OrgLinkCancelSuccess: '已取消关联',
  OrgLinkSyncSuccess: '同步成功',
  OrgSourceFrom: '来源：{source}',
  EditOrgLeader: '修改负责人',
};

export default locale;
