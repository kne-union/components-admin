import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo, useRef, useState } from 'react';
import { Alert, App } from 'antd';
import { useIntl } from '@kne/react-intl';
import BizUnit from '@components/BizUnit';
import withLocale from '../withLocale';
import Menu from '../Menu';

const getUserId = value => {
  const item = Array.isArray(value) ? value[0] : value;
  if (item && typeof item === 'object') {
    return item.value ?? item.id;
  }
  return item;
};

const getFilterUserId = filter => getUserId((filter || []).find(item => item.name === 'userId')?.value);

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
})(
  withLocale(({ remoteModules, data, onSuccess, apis: _apis, options, getFormInner, fetchOptions, ...props }) => {
    const [ConfirmButton, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <ConfirmButton
        {...props}
        danger
        message={formatMessage({ id: 'RevokeSessionConfirm' })}
        onClick={async () => {
          const { data: resData } = await ajax(Object.assign({}, apis.oidc.session.revoke, { data: { uid: data.uid } }));
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'SessionRevoked' }));
          onSuccess && onSuccess();
        }}>
        {formatMessage({ id: 'RevokeSession' })}
      </ConfirmButton>
    );
  })
);

const SessionManager = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Filter', 'components-core:TablePage@Table']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {}, defaultUserId }) => {
    const [usePreset, Filter, Table] = remoteModules;
    const { SuperSelectFilterItem } = Filter.fields;
    const { ajax, apis: presetApis } = usePreset();
    const { message, modal } = App.useApp();
    const { formatMessage } = useIntl();
    const apis = presetApis.oidc.session;
    const [filter, setFilter] = useState(() =>
      defaultUserId ? [{ name: 'userId', label: formatMessage({ id: 'User' }), value: { value: defaultUserId, label: String(defaultUserId) } }] : []
    );
    // 强制下线后会话列表整体变化，BizUnit 不暴露 reload，重新挂载列表刷新（筛选值受控，不会丢失）
    const [reloadKey, setReloadKey] = useState(0);
    const userId = getFilterUserId(filter);
    const dataRef = useRef([]);
    const { selectedRowKeys, selectedRows, setSelectedRowKeys, clearSelectedRows } = Table.useSelectedRow({ rowKey: 'uid' });

    const userApi = useMemo(
      () =>
        Object.assign({}, presetApis.admin.getUserList, {
          transformData: data =>
            Object.assign({}, data, {
              pageData: (data.pageData || []).map(item =>
                Object.assign({}, item, {
                  value: item.id,
                  label: item.nickname || item.name || item.email || item.phone
                })
              )
            })
        }),
      [presetApis.admin.getUserList]
    );

    return (
      <BizUnit
        isNext
        key={reloadKey}
        name="oidc-session-list"
        allowKeywordSearch={false}
        page={{
          title: formatMessage({ id: 'SessionManager' }),
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
        apis={{
          list: {
            loader: async ({ params, data }) => {
              const { userId: currentUserId } = Object.assign({}, data, params);
              if (!currentUserId) {
                return { pageData: [], totalCount: 0 };
              }
              const { data: resData } = await ajax(Object.assign({}, apis.list, { params: { userId: String(currentUserId) } }));
              if (resData.code !== 0) {
                throw new Error(resData.msg);
              }
              const list = resData.data || [];
              return { pageData: list, totalCount: list.length };
            }
          }
        }}
        getColumns={() => [
          {
            name: 'uid',
            title: formatMessage({ id: 'SessionUid' }),
            renderType: 'small',
            width: 240
          },
          {
            name: 'clients',
            title: formatMessage({ id: 'SessionClients' }),
            renderType: 'description',
            width: 240,
            getValueOf: item => (item.clients || []).map(client => client.clientId).join(', ')
          },
          {
            name: 'loginAt',
            title: formatMessage({ id: 'LoginAt' }),
            format: 'datetime',
            width: 180
          },
          {
            name: 'expiresAt',
            title: formatMessage({ id: 'ExpiresAt' }),
            format: 'datetime',
            width: 180
          }
        ]}
        getActionList={({ data, ...props }) => [
          {
            ...props,
            data,
            buttonComponent: RevokeSessionButton
          }
        ]}
        filter={{
          value: filter,
          onChange: value => {
            clearSelectedRows();
            setFilter(value);
          },
          list: [
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'userId',
                label: formatMessage({ id: 'User' }),
                single: true,
                api: userApi,
                pagination: { paramsType: 'params' },
                getSearchProps: ({ searchText }) => ({ filter: { keyword: searchText } })
              }
            }
          ]
        }}
        options={{
          bizName: formatMessage({ id: 'Session' }),
          mapFilterValue: value => ({ userId: getFilterUserId(value) }),
          tableProps: {
            rowKey: 'uid',
            pagination: { open: false },
            dataFormat: data => {
              dataRef.current = data.pageData || [];
              return { list: dataRef.current, total: data.totalCount, data };
            },
            topArea: () => (userId ? null : <Alert type="info" showIcon message={formatMessage({ id: 'SelectUserFirst' })} style={{ marginBottom: 12 }} />),
            rowSelection: {
              type: 'checkbox',
              selectedRowKeys,
              allowSelectedAll: false,
              onChange: keys => {
                setSelectedRowKeys(keys, dataRef.current || []);
              }
            },
            selectedRows,
            batchActions: [
              {
                key: 'batch-revoke',
                label: formatMessage({ id: 'RevokeSelectedSessions' }),
                danger: true,
                onClick: ({ selectedRowKeys: uids, reload }) => {
                  if (!uids?.length) {
                    return;
                  }
                  modal.confirm({
                    title: formatMessage({ id: 'RevokeSelectedSessionsConfirm' }, { count: uids.length }),
                    okButtonProps: { danger: true },
                    onOk: async () => {
                      let count = 0;
                      for (const uid of uids) {
                        const { data: resData } = await ajax(Object.assign({}, apis.revoke, { data: { uid } }));
                        if (resData.code === 0) {
                          count++;
                        }
                      }
                      message.success(formatMessage({ id: 'SessionsRevoked' }, { count }));
                      clearSelectedRows();
                      reload?.();
                    }
                  });
                }
              }
            ],
            buttonGroup: {
              list: [
                {
                  buttonComponent: RevokeUserButton,
                  disabled: !userId,
                  userId,
                  logout: false,
                  formatMessage,
                  confirmMessage: formatMessage({ id: 'RevokeTokensConfirm' }),
                  children: formatMessage({ id: 'RevokeTokens' })
                },
                {
                  buttonComponent: RevokeUserButton,
                  danger: true,
                  disabled: !userId,
                  userId,
                  logout: true,
                  formatMessage,
                  confirmMessage: formatMessage({ id: 'ForceLogoutConfirm' }),
                  onSuccess: () => {
                    clearSelectedRows();
                    setReloadKey(key => key + 1);
                  },
                  children: formatMessage({ id: 'ForceLogout' })
                }
              ]
            }
          }
        }}
      />
    );
  })
);

export default SessionManager;
