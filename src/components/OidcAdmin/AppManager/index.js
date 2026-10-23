import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import { useIntl } from '@kne/react-intl';
import BizUnit from '@components/BizUnit';
import { PermissionPanel } from '@components/Tenant';
import flattenPermissions from '@components/Tenant/TenantPermission/flattenPermissions';
import withLocale from '../withLocale';
import Menu from '../Menu';
import getColumns from './getColumns';

const ViewPermissionButton = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, data, onSuccess, apis, options, getFormInner, fetchOptions, ...props }) => {
    const [useModal] = remoteModules;
    const modal = useModal();
    const { formatMessage } = useIntl();
    const settings = Object.assign({ modules: [] }, data.permissions);
    return (
      <Button
        {...props}
        onClick={() => {
          modal({
            size: 'large',
            title: formatMessage({ id: 'AppPermissionTitle' }, { name: data.name }),
            children: <PermissionPanel settings={settings} value={flattenPermissions(settings).map(({ code }) => code)} disabled />,
            footerButtons: [{ type: 'primary', children: formatMessage({ id: 'Close' }) }]
          });
        }}
      >
        {formatMessage({ id: 'ViewPermissions' })}
      </Button>
    );
  })
);

/**
 * 应用中心：子应用通过服务接口注册，这里只能查看权限树、启停与删除；按租户开通在租户详情的「子应用」页签（TenantApps）
 */
const AppManager = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Filter']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset, Filter] = remoteModules;
    const { SuperSelectFilterItem } = Filter.fields;
    const { apis: presetApis } = usePreset();
    const { formatMessage } = useIntl();
    const apis = presetApis.oidc.app;

    return (
      <BizUnit
        isNext
        name="oidc-app-list"
        page={{
          title: formatMessage({ id: 'AppManager' }),
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
        apis={{
          list: apis.list,
          remove: apis.remove,
          setStatus: apis.setStatus
        }}
        getColumns={() => getColumns({ formatMessage })}
        getActionList={({ data, ...props }) => [{ ...props, data, type: 'link', buttonComponent: ViewPermissionButton }]}
        options={{
          bizName: formatMessage({ id: 'App' }),
          removeMessage: formatMessage({ id: 'RemoveAppConfirm' }),
          keywordFilterName: 'keyword',
          keywordFilterLabel: formatMessage({ id: 'Keyword' })
        }}
        filter={{
          list: [
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'tenantMode',
                label: formatMessage({ id: 'TenantMode' }),
                single: true,
                options: [
                  { value: 'client', label: formatMessage({ id: 'TenantModeClient' }) },
                  { value: 'independent', label: formatMessage({ id: 'TenantModeIndependent' }) }
                ]
              }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'status',
                label: formatMessage({ id: 'Status' }),
                single: true,
                options: [
                  { value: 'open', label: formatMessage({ id: 'StatusOpen' }) },
                  { value: 'closed', label: formatMessage({ id: 'StatusClosed' }) }
                ]
              }
            }
          ]
        }}
      />
    );
  })
);

export default AppManager;
