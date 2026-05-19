import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { Flex, Spin } from 'antd';
import get from 'lodash/get';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import SharedGroupModulesFormField from './SharedGroupModulesFormField';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules, apis, action: _action }) => {
    const [FormInfo] = remoteModules;
    const { formatMessage } = useIntl();
    const { Input, TextArea, SuperSelect } = FormInfo.fields;

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
                <SuperSelect
                  name="dataSourceTenantUserIds"
                  label={formatMessage({ id: 'SharedGroupDataSources' })}
                  description={formatMessage({ id: 'SharedGroupDataSourcesDesc' })}
                  api={merge({}, apis.userList, {
                    params: {
                      filter: { status: 'open' }
                    }
                  })}
                  valueKey="id"
                  labelKey="name"
                  interceptor="array-output-value"
                />,
                <SuperSelect
                  name="memberTenantUserIds"
                  label={formatMessage({ id: 'SharedGroupMembers' })}
                  description={formatMessage({ id: 'SharedGroupMembersDesc' })}
                  api={merge({}, apis.userList, {
                    params: {
                      filter: { status: 'open' }
                    }
                  })}
                  valueKey="id"
                  labelKey="name"
                  interceptor="array-output-value"
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
