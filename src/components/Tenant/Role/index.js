import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';
import getFilterList from './getFilterList';
import getRoleListFilterValue from './getRoleListFilterValue';
import FormInner from './FormInner';
import SetRolePermission from './Actions/SetRolePermission';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const Role = createWithRemoteLoader({
  modules: ['components-core:Filter']
})(({ remoteModules, apis, ...props }) => {
  const { formatMessage } = useIntl();
  const [Filter] = remoteModules;
  const { SuperSelectFilterItem } = Filter.fields;
  const columns = getColumns({ formatMessage });
  const filterList = useMemo(
    () => getFilterList({ formatMessage, SuperSelectFilterItem }),
    [formatMessage, SuperSelectFilterItem]
  );
  return (
    <BizUnit
      {...props}
      apis={apis}
      filterList={filterList}
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
        mapFilterValue: getRoleListFilterValue
      }}
    />
  );
});

export default withLocale(Role);
