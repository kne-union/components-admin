import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';
import FormInner from './FormInner';
import SetRolePermission from './Actions/SetRolePermission';

const Role = ({ apis }) => {
  return (
    <BizUnit
      apis={apis}
      getColumns={getColumns}
      getFormInner={props => {
        return <FormInner {...props} />;
      }}
      getActionList={({ data, ...props }) => {
        return ['remove', 'setStatusOpen', 'setStatusClose', 'save']
          .map(name => {
            return { name, hidden: data.type === 'system' };
          })
          .concat([
            {
              ...props,
              buttonComponent: SetRolePermission,
              data,
              children: '设置权限',
              hidden: data.code === 'admin'
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
