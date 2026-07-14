import { createWithRemoteLoader } from '@kne/remote-loader';
import { useCallback, useMemo } from 'react';
import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';
import getFilterList from './getFilterList';
import FormInner from './FormInner';
import SetRolePermission from './Actions/SetRolePermission';
import RoleMobileList from './RoleMobileList';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const Role = createWithRemoteLoader({
  modules: ['components-core:Filter']
})(({ remoteModules, apis, ...props }) => {
  const { formatMessage } = useIntl();
  const [Filter] = remoteModules;
  const { SuperSelectFilterItem, createFilterValueMapper } = Filter;
  const columns = getColumns({ formatMessage });
  const filter = useMemo(
    () => getFilterList({ formatMessage, SuperSelectFilterItem }),
    [formatMessage, SuperSelectFilterItem]
  );
  const mapFilterValue = useMemo(() => createFilterValueMapper({
    type: 'single'
  }), [createFilterValueMapper]);
  const renderMobile = useCallback(
    ({ dataSource, columns: mobileColumns, rowKey, context, empty } = {}) => (
      <RoleMobileList
        dataSource={dataSource}
        columns={mobileColumns}
        rowKey={rowKey}
        context={context}
        empty={empty}
        formatMessage={formatMessage}
      />
    ),
    [formatMessage]
  );
  return (
    <BizUnit
      isNext
      {...props}
      apis={apis}
      filter={filter}
      getColumns={() => columns}
      getFormInner={props => {
        return <FormInner {...props} />;
      }}
      getActionList={({ data, ...props }) => {
        return ['remove', 'setStatusOpen', 'setStatusClose', 'save']
          .map(name => {
            return {
              name,
              reset: ({ hidden }) => ({ name, hidden: hidden || data.type === 'system' })
            };
          })
          .concat([
            {
              ...props,
              buttonComponent: SetRolePermission,
              data,
              children: formatMessage({ id: 'SetPermission' }),
              hidden: data.code === 'admin' || !apis.permissionSave
            }
          ]);
      }}
      name="role-list"
      options={{
        bizName: formatMessage({ id: 'Role' }),
        mapFilterValue,
        createButtonProps: { size: 'small' },
        tableProps: { renderMobile }
      }}
    />
  );
});

export default withLocale(Role);
