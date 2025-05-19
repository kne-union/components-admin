const { LoginOuterContainer, Login } = _Account;
const {Flex, Radio, Space} = antd;
const {useState} = React;
const BaseExample = () => {
  const [type, setType] = useState('email');
  return (
    <Flex vertical gap={20}>
      <LoginOuterContainer />
      <Flex justify="center">
        <Space><span>类型:</span><Radio.Group value={type} onChange={(e) => {
          setType(e.target.value);
        }} options={[{label: '邮箱', value: 'email'}, {label: '手机', value: 'phone'}]}/></Space>
      </Flex>
      <LoginOuterContainer>
        <Login type={type}/>
      </LoginOuterContainer>
    </Flex>
  );
};

render(<BaseExample />);
