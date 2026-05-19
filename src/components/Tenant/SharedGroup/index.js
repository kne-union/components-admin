import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';
import FormInner from './FormInner';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import merge from 'lodash/merge';

/** SuperSelect array-output-value 回显需 [{ id, name }]，不能只传 id 字符串 */
const mapRelationUsersToSelectValue = items => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items
    .map(item => {
      const id = item.tenantUserId ?? item.tenantUser?.id;
      if (id == null || id === '') {
        return null;
      }
      const name = item.tenantUser?.name;
      return name != null && String(name).trim() !== '' ? { id, name: String(name) } : { id };
    })
    .filter(Boolean);
};

const mapRowToForm = data => {
  const row = data && typeof data.toJSON === 'function' ? data.toJSON() : data;
  return merge({}, row, {
    dataSourceTenantUserIds: mapRelationUsersToSelectValue(row.dataSources),
    memberTenantUserIds: mapRelationUsersToSelectValue(row.members),
    sharedModules: Array.isArray(row.sharedModules) ? row.sharedModules : []
  });
};

const SharedGroup = ({ apis, ...props }) => {
  const { formatMessage } = useIntl();
  const columns = getColumns({ formatMessage });
  return (
    <BizUnit
      {...props}
      apis={apis}
      getColumns={() => columns}
      getFormInner={formProps => {
        return <FormInner {...formProps} />;
      }}
      getActionList={() => ['remove', 'setStatusOpen', 'setStatusClose', 'save'].map(name => ({ name }))}
      name="shared-group-list"
      options={{
        bizName: formatMessage({ id: 'SharedGroup' }),
        saveData: data => mapRowToForm(data),
        formProps: ({ action, formData, ...rest }) => {
          const base =
            action === 'create'
              ? { sharedModules: [], dataSourceTenantUserIds: [], memberTenantUserIds: [] }
              : {};
          return merge({}, rest, {
            data: merge({}, base, formData)
          });
        }
      }}
    />
  );
};

export default withLocale(SharedGroup);
