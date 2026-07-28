import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import get from 'lodash/get';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import SharedGroupModulesFormField from './SharedGroupModulesFormField';
import TenantUserSelect from '../TenantUserSelect';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules, apis, action: _action }) => {
    const [FormInfo] = remoteModules;
    const { formatMessage } = useIntl();
    const { Input, TextArea } = FormInfo.fields;

    return (
      <Fetch
        {...merge({}, apis.permissionList)}
        render={({ data }) => {
          const permissions = get(data, 'permissions', { modules: [] });
          return (
            <FormInfo
              column={1}
              list={[
                <Input name="name" label={formatMessage({ id: 'SharedGroupName' })} rule="REQ LEN-2-100" />,
                <TextArea name="description" label={formatMessage({ id: 'Description' })} block />,
                <SharedGroupModulesFormField
                  key="shared-modules"
                  name="sharedModules"
                  label={formatMessage({ id: 'SharedGroupModulesLabel' })}
                  description={formatMessage({ id: 'SharedGroupModulesHint' })}
                  permissions={permissions}
                  rule="REQ"
                  block
                />,
                <TenantUserSelect.Input
                  name="dataSourceTenantUserIds"
                  label={formatMessage({ id: 'SharedGroupDataSources' })}
                  description={formatMessage({ id: 'SharedGroupDataSourcesDesc' })}
                  single={false}
                  userStatus="open"
                  orgApi={apis.orgList}
                  userApi={apis.userList}
                  block
                />,
                <TenantUserSelect.Input
                  name="memberTenantUserIds"
                  label={formatMessage({ id: 'SharedGroupMembers' })}
                  description={formatMessage({ id: 'SharedGroupMembersDesc' })}
                  single={false}
                  userStatus="open"
                  orgApi={apis.orgList}
                  userApi={apis.userList}
                  block
                />
              ]}
            />
          );
        }}
      />
    );
  })
);

export default FormInner;
