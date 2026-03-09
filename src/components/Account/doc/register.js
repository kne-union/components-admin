const { LoginOuterContainer, Register } = _Account;
const { Flex, Radio, Space, message } = antd;
const { useState } = React;

const BaseExample = () => {
  const [type, setType] = useState('email');
  
  return (
    <Flex vertical gap={20}>
      <Flex justify="center">
        <Space>
          <span>注册类型:</span>
          <Radio.Group
            value={type}
            onChange={e => {
              setType(e.target.value);
            }}
            options={[
              { label: '邮箱注册', value: 'email' },
              { label: '手机注册', value: 'phone' }
            ]}
          />
        </Space>
      </Flex>
      <Register
        type={type}
        loginUrl="/login"
        sendVerificationCode={({ type, data }) => {
          console.log(`发送验证码到 ${type}:`, data);
          message.success(`验证码已发送到 ${data}`);
          return Promise.resolve();
        }}
        onSubmit={formData => {
          console.log('注册信息:', formData);
          message.success('注册成功');
        }}
      />
    </Flex>
  );
};

render(<BaseExample />);
