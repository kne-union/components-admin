import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';
import FormInner from './FormInner';
import SetRolePermission from './Actions/SetRolePermission';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const Role = ({ apis, ...props }) => {
  const { formatMessage } = useIntl();
  const columns = getColumns({ formatMessage });
  return (
    <BizUnit
      {...props}
      apis={apis}
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
        bizName: formatMessage({ id: 'Role' })
      }}
    />
  );
};

export default withLocale(Role);
