const { ResetPassword } = _Account;
const { Flex, message } = antd;

const BaseExample = () => {
  return (
    <Flex vertical gap={20}>
      <ResetPassword
        type="email"
        account="zhangsan@company.com"
        loginUrl="/login"
        onSubmit={formData => {
          console.log('重置密码:', formData);
          message.success('密码重置成功，请使用新密码登录');
        }}
      />
      <ResetPassword
        type="phone"
        account="+86 13800138000"
        loginUrl="/login"
        onSubmit={formData => {
          console.log('重置密码:', formData);
          message.success('密码重置成功，请使用新密码登录');
        }}
      />
    </Flex>
  );
};

render(<BaseExample />);
