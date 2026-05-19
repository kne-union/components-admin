import { createWithRemoteLoader } from '@kne/remote-loader';
import omit from 'lodash/omit';
import SharedGroupModulesField from './SharedGroupModulesField';

/**
 * FormInfo 正式字段：通过 FormInfo.hooks.useDecorator 接入表单布局与校验，
 * 避免自定义区域被表单项透明层拦截导致 Checkbox 无法点击。
 */
const SharedGroupModulesFormField = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, permissions, ...props }) => {
  const [FormInfo] = remoteModules;
  const { useDecorator } = FormInfo.hooks;
  const fieldProps = omit(props, ['remoteModules', 'permissions']);
  const render = useDecorator(fieldProps);

  const InnerControl = ({ value, onChange, disabled }) => (
    <SharedGroupModulesField
      layout="field"
      permissions={permissions}
      value={Array.isArray(value) ? value : []}
      onChange={onChange}
      disabled={disabled}
    />
  );

  return render(InnerControl);
});

export default SharedGroupModulesFormField;
