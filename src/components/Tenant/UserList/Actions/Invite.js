import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { Flex, App } from 'antd';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';

const InviteInner = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Modal@useModal', 'components-core:Global@usePreset', 'components-core:InfoPage@CentralContent']
})(({ remoteModules, data, apis, onSuccess, ...props }) => {
  const [LoadingButton, useModal, usePreset, CentralContent] = remoteModules;
  const { ajax } = usePreset();
  const modal = useModal();
  const { formatMessage } = useIntl();
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
          title: formatMessage({ id: 'InviteUser' }),
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
                      title: formatMessage({ id: 'Name' })
                    },
                    {
                      name: 'token',
                      title: formatMessage({ id: 'InviteLink' }),
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
                    message.success(formatMessage({ id: 'SendSuccess' }));
                  }}
                >
                  {formatMessage({ id: 'SendInviteEmail' })}
                </LoadingButton>
                <LoadingButton
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${window.location.origin}/join-tenant?token=${resData.data.token}`);
                    message.success(formatMessage({ id: 'CopySuccess' }));
                  }}
                >
                  {formatMessage({ id: 'CopyInviteLink' })}
                </LoadingButton>
              </Flex>
            </Flex>
          )
        });
      }}
    />
  );
});

export default withLocale(InviteInner);
