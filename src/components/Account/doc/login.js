const { LoginOuterContainer, Login } = _Account;
const { Flex, Radio, Space, message } = antd;
const { useState } = React;

const BaseExample = () => {
  const [type, setType] = useState('email');
  
  return (
    <Flex vertical gap={20}>
      <Flex justify="center">
        <Space>
          <span>登录类型:</span>
          <Radio.Group
            value={type}
            onChange={e => {
              setType(e.target.value);
            }}
            options={[
              { label: '邮箱登录', value: 'email' },
              { label: '手机登录', value: 'phone' }
            ]}
          />
        </Space>
      </Flex>
      <LoginOuterContainer
        title="企业管理系统"
        logo="https://api.dicebear.com/7.x/shapes/svg?seed=company">
        <Login
          type={type}
          registerUrl="/register"
          forgetUrl="/forget"
          onSubmit={formData => {
            console.log('登录信息:', formData);
            message.success(`登录成功: ${formData[type]}`);
          }}
        />
      </LoginOuterContainer>
    </Flex>
  );
};

render(<BaseExample />);
