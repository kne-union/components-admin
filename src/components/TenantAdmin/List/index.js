import { createWithRemoteLoader } from '@kne/remote-loader';
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import getColumns from './getColumns';
import buildActionList from '../Actions/buildActionList';
import TenantCardList from './TenantCardList';
import BizUnit from '@components/BizUnit';
import FormInner from '../FormInner';

const ListInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, showLength, optionsColumn }) => {
  const [usePreset] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis } = usePreset();
  const navigate = useNavigate();

  const renderCards =
    (layout, reload) =>
    ({ dataSource } = {}) => (
      <TenantCardList
        layout={layout}
        dataSource={dataSource}
        showLength={showLength}
        onDetail={item => navigate(`detail?id=${encodeURIComponent(item.id)}`)}
        onSuccess={reload}
      />
    );

  return (
    <BizUnit
      name="tenant-list"
      apis={{
        list: apis.tenantAdmin.list,
        // 工具栏「添加」；行内编辑仍走自定义 Save（回填 serviceTime / tenantId）
        create: ({ formData }) =>
          Object.assign({}, apis.tenantAdmin.create, {
            data: Object.assign({}, formData, {
              serviceStartTime: formData.serviceTime?.[0],
              serviceEndTime: formData.serviceTime?.[1]
            })
          })
      }}
      getColumns={() => getColumns({ navigate, formatMessage })}
      getFormInner={({ action, data }) => <FormInner tenantId={action === 'edit' ? data?.id : undefined} />}
      getActionList={({ data, ...props }) => buildActionList({ formatMessage, data, ...props })}
      options={{
        bizName: formatMessage({ id: 'TenantName' }),
        createButtonProps: {
          children: formatMessage({ id: 'AddTenant' }),
          type: 'primary'
        },
        mapFilterValue: (value, getFilterValue) => ({
          filter: getFilterValue(value)
        }),
        ...(Number.isInteger(showLength) ? { showLength } : {}),
        ...(optionsColumn ? { optionsColumn } : {}),
        tableProps: {
          tab: {
            name: 'status',
            label: formatMessage({ id: 'Status' }),
            list: [
              { label: formatMessage({ id: 'Open' }), value: 'open' },
              { label: formatMessage({ id: 'Close' }), value: 'closed' }
            ]
          },
          pagination: { paramsType: 'params' }
        }
      }}
    >
      {({ tableOptions }) => {
        const reload = () => tableOptions.ref?.current?.reload?.();
        return (
          <BizUnit.TablePageRender
            tableOptions={Object.assign({}, tableOptions, {
              renderMobile: renderCards('mobile', reload),
              renderCard: renderCards('card', reload)
            })}
          />
        );
      }}
    </BizUnit>
  );
});

export default withLocale(ListInner);
