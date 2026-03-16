const { UserInfo } = _Authenticate;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const UserInfoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Global@GlobalValue']
})(({ remoteModules }) => {
  const [PureGlobal, GlobalValue] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <UserInfo>
        <GlobalValue globalKey="userInfo">
          {({ value }) => {
            const { nickname, email, avatar, description } = Object.assign({}, value?.value);
            return (
              <div style={{ padding: 20 }}>
                <h3>用户信息</h3>
                <p><strong>头像：</strong><img src={avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} /></p>
                <p><strong>昵称：</strong>{nickname}</p>
                <p><strong>邮箱：</strong>{email}</p>
                <p><strong>描述：</strong>{description}</p>
              </div>
            );
          }}
        </GlobalValue>
      </UserInfo>
    </PureGlobal>
  );
});

render(<UserInfoExample />);
