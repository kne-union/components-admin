const locale = {
  // Interaction
  OidcLoginTitle: '登录',
  OidcLoginTo: '登录到 {clientName}',
  OidcInvalidInteraction: '登录会话已失效',
  OidcInvalidInteractionDesc: '请返回应用重新发起登录',
  OidcMissingUid: '缺少登录会话参数',
  OidcCancelLogin: '取消登录',
  OidcAccountNotInitialized: '账号尚未初始化，请先在账号中心完成初始化',
  OidcAccountDisabled: '账号已被禁用',
  OidcAccountClosed: '账号已被关闭',
  OidcSelectTenant: '选择要进入的租户',
  OidcSelectTenantDesc: '你的账号属于多个租户，请选择本次要登录的租户',
  OidcNoTenant: '当前账号没有可用的租户',
  OidcConsentTitle: '授权确认',
  OidcConsentDesc: '{clientName} 请求访问你的以下信息',
  OidcConsentAllow: '同意授权',
  OidcConsentDeny: '拒绝',
  OidcScopes: '权限范围',
  OidcCurrentAccount: '当前账号',
  OidcUnknownPrompt: '暂不支持的登录步骤：{name}',
  // Callback
  OidcCallbackLoading: '正在完成登录…',
  OidcCallbackFailed: '登录失败',
  OidcRetryLogin: '重新登录',
  // OidcAuthenticate
  OidcRedirecting: '正在跳转登录…',
  // TenantSwitch
  OidcSwitchTenant: '切换租户',
  OidcSwitchingTenant: '正在切换租户…',
  OidcCurrentTenant: '当前租户',
  // Logout
  OidcLogout: '退出登录'
};

export default locale;
