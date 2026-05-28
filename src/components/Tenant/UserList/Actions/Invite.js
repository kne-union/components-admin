import '@kne/react-box/dist/index.css';
import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App, Button, Flex, Input, Space, Typography } from 'antd';
import { CopyOutlined, MailOutlined } from '@ant-design/icons';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
import TenantUserPersonalCard from '../UserPersonalCard';
import style from './inviteModal.module.scss';

const buildInviteUrl = token => `${window.location.origin}/join-tenant?token=${token}`;

const InviteInner = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Modal@useModal', 'components-core:Global@usePreset']
})(({ remoteModules, data, apis, onSuccess, ...props }) => {
  const [LoadingButton, useModal, usePreset] = remoteModules;
  const { ajax } = usePreset();
  const modal = useModal();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();

  const copyInviteLink = async url => {
    await navigator.clipboard.writeText(url);
    message.success(formatMessage({ id: 'CopySuccess' }));
  };

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
        const token = resData.data?.token;
        if (!token) {
          return;
        }
        const inviteUrl = buildInviteUrl(token);
        modal({
          title: formatMessage({ id: 'InviteUser' }),
          size: 'small',
          width: 560,
          footer: null,
          children: (
            <Flex vertical gap={20} className={style.inviteModal}>
              <Typography.Paragraph type="secondary" className={style.hint}>
                {formatMessage({ id: 'InviteUserHint' })}
              </Typography.Paragraph>

              <TenantUserPersonalCard data={data} />

              <div className={style.section}>
                <div className={style.fieldLabel}>{formatMessage({ id: 'InviteLink' })}</div>
                <Space.Compact className={style.linkRow}>
                  <Input readOnly value={inviteUrl} />
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => {
                      copyInviteLink(inviteUrl);
                    }}>
                    {formatMessage({ id: 'CopyInviteLink' })}
                  </Button>
                </Space.Compact>
              </div>

              <Flex gap={8} justify="flex-end" wrap="wrap" className={style.actions}>
                {apis.userInviteMessage ? (
                  <LoadingButton
                    type="primary"
                    icon={<MailOutlined />}
                    onClick={async () => {
                      const { data: sendRes } = await ajax(
                        merge({}, apis.userInviteMessage, {
                          data: { id: data.id }
                        })
                      );
                      if (sendRes.code !== 0) {
                        return;
                      }
                      message.success(formatMessage({ id: 'SendSuccess' }));
                      onSuccess && onSuccess();
                    }}>
                    {formatMessage({ id: 'SendInviteEmail' })}
                  </LoadingButton>
                ) : null}
              </Flex>
            </Flex>
          )
        });
      }}
    />
  );
});

export default withLocale(InviteInner);
