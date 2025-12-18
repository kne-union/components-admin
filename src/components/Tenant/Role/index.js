import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';
import FormInner from './FormInner';
import SetRolePermission from './Actions/SetRolePermission';

const Role = ({ apis, ...props }) => {
  return (
    <BizUnit
      {...props}
      apis={apis}
      getColumns={getColumns}
      getFormInner={props => {
        return <FormInner {...props} />;
      }}
      getActionList={({ data, ...props }) => {
        return ['remove', 'setStatusOpen', 'setStatusClose', 'save']
          .map(name => {
            return ({ hidden }) => ({ name, hidden: hidden || data.type === 'system' });
          })
          .concat([
            {
              ...props,
              buttonComponent: SetRolePermission,
              data,
              children: '设置权限',
              hidden: data.code === 'admin' || !apis.permissionSave
            }
          ]);
      }}
      name="role-list"
      options={{
        bizName: '角色'
      }}
    />
  );
};

export default Role;
