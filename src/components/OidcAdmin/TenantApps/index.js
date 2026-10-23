import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { App, Empty, Flex, List, Switch, Typography } from 'antd';
import merge from 'lodash/merge';
import { useState } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { toggleAppCodes } from './utils';

/**
 * 租户维度开关子应用（宿主）：数据来自租户权限树中的应用中心节点，更细的功能开关在「权限」页签调整。
 * 通过 plugins.admin.tenant.appendTabDetails 挂到 TenantAdmin 详情
 */
const TenantApps = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, tenant, apis: propsApis, prefix = 'apps' }) => {
    const [usePreset] = remoteModules;
    const { ajax, apis: presetApis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const [loadingCode, setLoadingCode] = useState(null);
    const apis = Object.assign({}, presetApis.tenantAdmin?.permission, propsApis);
    const tenantId = tenant?.id;

    return (
      <Fetch
        {...merge({}, apis.list, { params: { tenantId } })}
        render={({ data, reload }) => {
          const codes = data.codes || [];
          const appCenter = (data.permissions?.modules || []).find(item => item.code === prefix);
          const appModules = appCenter?.modules || [];
          if (!appModules.length) {
            return <Empty description={formatMessage({ id: 'NoRegisteredApps' })} />;
          }
          const onToggle = async (appModule, enabled) => {
            setLoadingCode(appModule.code);
            try {
              const { data: resData } = await ajax(
                merge({}, apis.save, { data: { tenantId, permissions: toggleAppCodes({ codes, appModule, enabled, prefix }) } })
              );
              if (resData.code !== 0) {
                return;
              }
              message.success(formatMessage({ id: enabled ? 'AppEnabled' : 'AppDisabled' }, { name: appModule.name }));
              reload();
            } finally {
              setLoadingCode(null);
            }
          };
          return (
            <Flex vertical gap={8}>
              <Typography.Text type="secondary">{formatMessage({ id: 'TenantAppsTips' })}</Typography.Text>
              <List
                bordered
                dataSource={appModules}
                renderItem={appModule => {
                  const enabled = codes.includes(`${prefix}:${appModule.code}`);
                  return (
                    <List.Item
                      actions={[
                        <Switch
                          key="switch"
                          checked={enabled}
                          loading={loadingCode === appModule.code}
                          onChange={checked => onToggle(appModule, checked)}
                        />
                      ]}
                    >
                      <List.Item.Meta title={appModule.name} description={appModule.code} />
                    </List.Item>
                  );
                }}
              />
            </Flex>
          );
        }}
      />
    );
  })
);

export default TenantApps;
