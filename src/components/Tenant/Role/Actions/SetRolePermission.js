import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import merge from 'lodash/merge';
import TenantPermission from '../../TenantPermission';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';

const SetRolePermissionInner = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(({ remoteModules, onSuccess, data, apis, options, getFormInner, ...props }) => {
  const [useModal] = remoteModules;
  const modal = useModal();
  const { formatMessage } = useIntl();
  return (
    <Button
      {...props}
      onClick={() => {
        modal({
          title: formatMessage({ id: 'SetRolePermission' }),
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

export default withLocale(SetRolePermissionInner);
