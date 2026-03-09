const { LoginOuterContainer, ForgetByEmail } = _Account;
const { message } = antd;

const BaseExample = () => {
  return (
    <LoginOuterContainer title="企业管理系统">
      <ForgetByEmail
        loginUrl="/login"
        onSubmit={(formData, callback) => {
          console.log('忘记密码邮箱:', formData);
          // 模拟发送重置密码邮件
          setTimeout(() => {
            callback();
            message.success('重置密码链接已发送到您的邮箱');
          }, 1000);
        }}
      />
    </LoginOuterContainer>
  );
};

render(<BaseExample />);
