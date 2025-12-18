import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import merge from 'lodash/merge';
import TenantPermission from '../../TenantPermission';

const SetRolePermission = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal', 'components-core:Global@usePreset']
})(({ remoteModules, onSuccess, data, apis, options, getFormInner, ...props }) => {
  const [useModal, usePreset] = remoteModules;
  const modal = useModal();
  const { ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <Button
      {...props}
      onClick={() => {
        modal({
          title: '设置角色权限',
          size: 'large',
          footer: null,
          children: (
            <TenantPermission
              apis={{
                list: merge({}, apis.permissionList, {
                  params: {
                    id: data.id
                  }
                }),
                save: merge({}, apis.permissionSave, {
                  data: {
                    id: data.id
                  }
                })
              }}
            />
          )
        });
      }}
    />
  );
});

export default SetRolePermission;
