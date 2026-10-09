import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { App, Empty, Flex, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import Fetch from '@kne/react-fetch';
import { useIntl } from '@kne/react-intl';
import UserSelect from '@components/UserSelect';
import withLocale from '../withLocale';
import Menu from '../Menu';
import style from '../style.module.scss';

const formatTime = value => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-');

const getUserId = value => {
  const item = Array.isArray(value) ? value[0] : value;
  if (item && typeof item === 'object') {
    return item.value ?? item.id;
  }
  return item;
};

const RevokeUserButton = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, userId, logout, confirmMessage, onSuccess, formatMessage, ...props }) => {
  const [ConfirmButton, usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  return (
    <ConfirmButton
      {...props}
      message={confirmMessage}
      onClick={async () => {
        const { data: resData } = await ajax(Object.assign({}, apis.oidc.session.revokeUser, { data: { userId: String(userId), logout } }));
        if (resData.code !== 0) {
          return;
        }
        message.success(formatMessage({ id: 'RevokeUserSuccess' }, { grants: resData.data?.grants ?? 0, sessions: resData.data?.sessions ?? 0 }));
        onSuccess && onSuccess();
      }}
    />
  );
});

const RevokeSessionButton = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, uid, onSuccess, formatMessage, ...props }) => {
  const [ConfirmButton, usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  return (
    <ConfirmButton
      {...props}
      message={formatMessage({ id: 'RevokeSessionConfirm' })}
      onClick={async () => {
        const { data: resData } = await ajax(Object.assign({}, apis.oidc.session.revoke, { data: { uid } }));
        if (resData.code !== 0) {
          return;
        }
        message.success(formatMessage({ id: 'SessionRevoked' }));
        onSuccess && onSuccess();
      }}>
      {formatMessage({ id: 'RevokeSession' })}
    </ConfirmButton>
  );
});

const SessionManager = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@Page']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {}, defaultUserId }) => {
    const [usePreset, Page] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const [user, setUser] = useState(defaultUserId ? { value: defaultUserId } : null);
    const userId = getUserId(user);

    return (
      <Page
        {...pageProps}
        title={formatMessage({ id: 'SessionManager' })}
        menu={<Menu baseUrl={baseUrl} />}
        children={
          <Flex vertical gap={16}>
            <div className={style['session-user-select']}>
              <UserSelect.Field single value={user} onChange={setUser} placeholder={formatMessage({ id: 'SelectUser' })} />
            </div>
            {userId ? (
              <Fetch
                {...Object.assign({}, apis.oidc.session.list, { params: { userId: String(userId) } })}
                render={({ data, reload }) => (
                  <Flex vertical gap={12}>
                    <Flex gap={8} wrap>
                      <RevokeUserButton
                        userId={userId}
                        logout={false}
                        formatMessage={formatMessage}
                        confirmMessage={formatMessage({ id: 'RevokeTokensConfirm' })}
                        onSuccess={reload}>
                        {formatMessage({ id: 'RevokeTokens' })}
                      </RevokeUserButton>
                      <RevokeUserButton
                        danger
                        userId={userId}
                        logout
                        formatMessage={formatMessage}
                        confirmMessage={formatMessage({ id: 'ForceLogoutConfirm' })}
                        onSuccess={reload}>
                        {formatMessage({ id: 'ForceLogout' })}
                      </RevokeUserButton>
                    </Flex>
                    <Table
                      rowKey="uid"
                      size="middle"
                      pagination={false}
                      scroll={{ x: 'max-content' }}
                      dataSource={data || []}
                      columns={[
                        { dataIndex: 'uid', title: formatMessage({ id: 'SessionUid' }) },
                        { dataIndex: 'loginAt', title: formatMessage({ id: 'LoginAt' }), render: formatTime },
                        { dataIndex: 'expiresAt', title: formatMessage({ id: 'ExpiresAt' }), render: formatTime },
                        {
                          dataIndex: 'clients',
                          title: formatMessage({ id: 'SessionClients' }),
                          render: clients => (
                            <Flex gap={4} wrap>
                              {(clients || []).map(item => (
                                <Tag key={item.clientId}>{item.clientId}</Tag>
                              ))}
                            </Flex>
                          )
                        },
                        {
                          key: 'options',
                          fixed: 'right',
                          render: (_, item) => (
                            <RevokeSessionButton type="link" danger uid={item.uid} formatMessage={formatMessage} onSuccess={reload} />
                          )
                        }
                      ]}
                    />
                  </Flex>
                )}
              />
            ) : (
              <Empty description={formatMessage({ id: 'SelectUserFirst' })} />
            )}
          </Flex>
        }
      />
    );
  })
);

export default SessionManager;
