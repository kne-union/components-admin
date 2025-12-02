import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';
import FormInner from './FormInner';

const Role = ({ apis }) => {
  return (
    <BizUnit
      apis={apis}
      getColumns={getColumns}
      getFormInner={props => {
        return <FormInner {...props} />;
      }}
      getActionList={({ data }) => {
        if (data.type === 'system') {
          return ['remove', 'setStatusOpen', 'setStatusClose', 'save'].map(name => {
            return { name, hidden: true };
          });
        }
        return [];
      }}
      name="role-list"
      options={{
        bizName: '角色'
      }}
    />
  );
};

export default Role;
