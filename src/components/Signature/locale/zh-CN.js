const locale = {
  // Columns
  AppId: 'AppId',
  SecretKey: 'SecretKey',
  BelongUser: '所属用户',
  Description: '描述',
  LastVisitedAt: '最后访问时间',
  Status: '状态',
  CreatedAt: '创建时间',

  // Status values
  Enabled: '启用',
  Disabled: '禁用',

  // Actions
  AddSecretKey: '添加密钥',
  Verify: '验证',
  Operation: '操作',

  // Form labels
  VerifySecretKey: '验证密钥',
  Signature: '签名',
  Timestamp: '时间戳',
  ExpireTime: '过期时间',

  // Messages
  SecretKeyGenerated: '密钥生成成功',
  SaveSecretKeyWarning: '请妥善保存当前密钥，关闭窗口后将不能再获取到，请勿泄漏',
  VerifySuccess: '验证成功',
  VerifyFailed: '验证失败',
  OperationSuccess: '操作成功',
  DeleteSuccess: '删除成功',

  // Confirm messages
  DisableSecretKeyTitle: '温馨提示',
  DisableSecretKeyMessage: '禁用此密钥后，将拒绝此密钥的所有请求。是否确定要禁用此密钥？',
  EnableSecretKeyMessage: '启用此密钥后，将允许此密钥访问请求。是否确定要启用此密钥？',

  // Form rules
  InputNumber: '请输入数字'
};

export default locale;
