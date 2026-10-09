import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { Button, Dropdown, Spin } from 'antd';
import { SwapOutlined, CheckOutlined } from '@ant-design/icons';
import Fetch from '@kne/react-fetch';
import { useIntl } from '@kne/react-intl';
import withOidcClient from './withOidcClient';
import withLocale from './withLocale';

const getTenantName = item => item?.tenant?.tenantCompany?.name || item?.tenant?.name || item?.tenantId;

const TenantSwitch = withOidcClient(
  createWithRemoteLoader({
    modules: ['components-core:Global@usePreset']
  })(
    withLocale(({ remoteModules, client, api, returnTo, children, ...props }) => {
      const [usePreset] = remoteModules;
      const { apis } = usePreset();
      const { formatMessage } = useIntl();
      const [switching, setSwitching] = useState(false);
      const currentTenantId = client.getTenantId();

      const switchTenant = tenantId => {
        if (!tenantId || String(tenantId) === String(currentTenantId)) {
          return;
        }
        setSwitching(true);
        return Promise.resolve(client.switchTenant(tenantId, { returnTo })).finally(() => {
          setSwitching(false);
        });
      };

      return (
        <Fetch
          {...Object.assign({}, api || apis.tenant.availableList)}
          render={({ data }) => {
            const list = (data?.list || []).filter(item => item.status === 'open');
            if (typeof children === 'function') {
              return children({ list, currentTenantId, switching, switchTenant });
            }
            const current = list.find(item => String(item.tenantId) === String(currentTenantId));
            return (
              <Spin spinning={switching} tip={formatMessage({ id: 'OidcSwitchingTenant' })}>
                <Dropdown
                  trigger={['click']}
                  disabled={switching || list.length < 2}
                  menu={{
                    selectedKeys: currentTenantId ? [String(currentTenantId)] : [],
                    items: list.map(item => ({
                      key: String(item.tenantId),
                      label: getTenantName(item),
                      icon: String(item.tenantId) === String(currentTenantId) ? <CheckOutlined /> : null
                    })),
                    onClick: ({ key }) => switchTenant(key)
                  }}>
                  <Button icon={<SwapOutlined />} {...props}>
                    {current ? getTenantName(current) : formatMessage({ id: 'OidcSwitchTenant' })}
                  </Button>
                </Dropdown>
              </Spin>
            );
          }}
        />
      );
    })
  )
);

export default TenantSwitch;
