
# Account


### 概述

用于用户注册登录忘记密码


### 示例(全屏)

#### 示例代码

- Login
- 登录
- _Account(@components/Account),antd(antd)

```jsx
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

```

- Register
- 注册
- _Account(@components/Account),antd(antd)

```jsx
const { LoginOuterContainer, Register } = _Account;
const { Flex, Radio, Space } = antd;
const { useState } = React;
const BaseExample = () => {
  const [type, setType] = useState('email');
  return (
    <Flex vertical gap={8}>
      <Space>
        <span>类型:</span>
        <Radio.Group
          value={type}
          onChange={e => {
            setType(e.target.value);
          }}
          options={[
            { label: '邮箱', value: 'email' },
            { label: '手机', value: 'phone' }
          ]}
        />
      </Space>
      <Register type={type} />
    </Flex>
  );
};

render(<BaseExample />);

```

- Modify
- 修改密码
- _Account(@components/Account),antd(antd)

```jsx
const {Modify} = _Account;
const {Flex} = antd;
const BaseExample = () => {
    return <Flex vertical gap={8}>
        <Modify account="test@test.com"/>
        <Modify type="phone" account="+81 17029292828"/>
    </Flex>;
};

render(<BaseExample/>);

```

- ForgetByEmail
- 忘记密码（邮箱）
- _Account(@components/Account),antd(antd)

```jsx
const {LoginOuterContainer, ForgetByEmail} = _Account;
const BaseExample = () => {
    return <LoginOuterContainer>
        <ForgetByEmail onSubmit={(data, callback) => {
            callback();
        }}/>
    </LoginOuterContainer>;
};

render(<BaseExample/>);

```

- ResetPassword
- 重置密码
- _Account(@components/Account),antd(antd)

```jsx
const {ResetPassword} = _Account;
const {Flex} = antd;
const BaseExample = () => {
    return <Flex vertical gap={8}>
        <ResetPassword account="test@test.com"/>
        <ResetPassword type="phone" account="+81 17029292828"/>
    </Flex>;
};

render(<BaseExample/>);

```


### API

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |

