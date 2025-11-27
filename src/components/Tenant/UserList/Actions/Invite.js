import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { Flex, App } from 'antd';

const Invite = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Modal@useModal', 'components-core:Global@usePreset', 'components-core:InfoPage@CentralContent']
})(({ remoteModules, data, apis, onSuccess, ...props }) => {
  const [LoadingButton, useModal, usePreset, CentralContent] = remoteModules;
  const { ajax } = usePreset();
  const modal = useModal();
  const { message } = App.useApp();
  return (
    <LoadingButton
      {...props}
      onClick={async () => {
        const { data: resData } = await ajax(
          merge({}, apis.inviteToken, {
            params: { id: data.id }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        modal({
          title: '邀请用户',
          footer: null,
          children: (
            <Flex vertical gap={40}>
              <Flex flex={1}>
                <CentralContent
                  dataSource={Object.assign({}, data, {
                    token: resData.data.token
                  })}
                  columns={[
                    {
                      name: 'id',
                      title: 'ID'
                    },
                    {
                      name: 'name',
                      title: '姓名'
                    },
                    {
                      name: 'token',
                      title: '邀请链接',
                      block: true,
                      render: value => {
                        return `${window.location.origin}/join-tenant?token=${value}`;
                      }
                    }
                  ]}
                />
              </Flex>
              <Flex gap={8} justify="center">
                <LoadingButton
                  type="primary"
                  onClick={async () => {
                    const { data: resData } = await ajax(
                      merge({}, apis.userInviteMessage, {
                        data: { id: data.id }
                      })
                    );
                    if (resData.code !== 0) {
                      return;
                    }
                    message.success('发送成功');
                  }}
                >
                  发送邀请邮件
                </LoadingButton>
                <LoadingButton
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${window.location.origin}/join-tenant?token=${resData.data.token}`);
                    message.success('复制成功');
                  }}
                >
                  复制邀请链接
                </LoadingButton>
              </Flex>
            </Flex>
          )
        });
      }}
    />
  );
});

export default Invite;
