const locale = {
  // User List columns
  Avatar: '头像',
  Nickname: '昵称',
  Email: '邮箱',
  Phone: '手机',
  IsSuperAdmin: '是否超级管理员',
  SuperAdmin: '超级管理员',
  Status: '状态',
  Bio: '个人简介',

  // Status values
  Yes: '是',
  No: '否',
  Normal: '正常',
  NotActivated: '初始化未激活',
  Disabled: '已禁用',
  Closed: '已关闭',
  Other: '其他',

  // Actions
  AddUser: '添加用户',
  AddSuccess: '添加成功',
  EditUser: '编辑用户',
  EditUserInfo: '编辑用户信息',
  DeleteSuccess: '删除成功',
  SaveSuccess: '保存成功',
  Action: '操作',
  Keyword: '关键字',

  // FormInner labels
  UserAvatar: '头像',
  UserNickname: '昵称',
  UserEmail: '邮箱',
  UserPhone: '手机',

  // Reset Password
  Password: '密码',
  RepeatPassword: '重复密码',
  ResetPassword: '重置密码',
  ModifyPassword: '修改密码',
  ModifyPasswordSuccess: '修改密码成功',

  // More Actions
  SetSuperAdmin: '设置超管',
  CancelSuperAdmin: '取消超管',
  SetSuperAdminConfirm: '确定要设置账号为超管吗？',
  CancelSuperAdminConfirm: '确定要取消账号的超管权限吗？',
  SetNormal: '设置为正常',
  SetNormalConfirm: '确定要设置账号为正常吗？',
  SetNormalSuccess: '账号已开启',
  CloseUser: '关闭',
  CloseAccountConfirm: '确定要关闭该账号吗？',
  CloseUserSuccess: '账号已关闭',
  SetStatusSuccess: '设置成功',

  // Filter labels
  FilterEmail: '邮箱',
  FilterPhone: '手机',
  FilterStatus: '状态',
  FilterIsAdmin: '是否管理员',

  // Confirm
  Confirm: '确认',

  // InitAdmin
  InitSystem: '初始化系统',
  InitSystemDesc: '首次进入管理后台时，需要把当前登录用户设为超级管理员，之后才能进行用户、权限等管理操作。',
  InitSystemHintOnce: '本操作只能执行一次，请确认当前账号正确',
  InitSystemHintUser: '完成后，当前用户将成为系统超级管理员',
  InitSystemHintNext: '初始化成功后将自动进入管理后台',
  InitSystemPending: '正在初始化超级管理员…',
  InitSystemFailed: '初始化失败，请稍后重试',
  InitSystemRetry: '重新初始化',
  InitSuccess: '初始化管理员成功！',

  // AdminLayout 内置导航
  NavUserManagement: '用户管理',
  NavFileManagement: '文件管理',
  NavMessageManagement: '消息管理',
  NavPlatformManagement: '平台管理',
  NavAuthManagement: '认证管理',
  NavPlatformLink: '平台关联',
  NavOidcClients: '应用管理',
  NavOidcResourceServers: '资源服务',
  NavOidcKeys: '签名密钥',
  NavOidcSessions: '登录会话',
  NavOidcApps: '应用中心'
};

export default locale;
