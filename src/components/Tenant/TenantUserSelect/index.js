import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import OrgTenantUserField from './OrgTenantUserField';
import withLocale from '../withLocale';

const createComponent = (callback = item => item) => {
  return createWithRemoteLoader({
    modules: ['components-core:Global@usePreset']
  })(
    withLocale(({ remoteModules, orgApi, userApi, userStatus, companyName, showOrgRoot, single, ...props }) => {
      const [usePreset] = remoteModules;
      const { apis } = usePreset();
      const Component = callback(OrgTenantUserField);
      return (
        <Component
          {...props}
          single={single}
          showOrgRoot={showOrgRoot}
          companyName={companyName}
          userStatus={userStatus}
          orgApi={merge({}, apis.tenant?.orgList, orgApi)}
          userApi={merge({}, apis.tenant?.userList, userApi)}
        />
      );
    })
  );
};

const TenantUserSelect = createComponent();

TenantUserSelect.Field = createComponent(item => item.Field);

export default TenantUserSelect;
