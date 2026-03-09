const { default: Account } = _Account;

const BaseExample = () => {
  return (
    <Account
      onSubmit={formData => {
        console.log('登录数据:', formData);
      }}
    />
  );
};

render(<BaseExample />);
