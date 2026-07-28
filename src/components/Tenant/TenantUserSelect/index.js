import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { useMemo } from 'react';
import OrgTenantUserField from './OrgTenantUserField';
import OrgTenantUserSelectInput from './OrgTenantUserSelectInput';
import withLocale from '../withLocale';

const createComponent = (Target, callback = item => item) => {
  return createWithRemoteLoader({
    modules: ['components-core:Global@usePreset']
  })(
    withLocale(({ remoteModules, orgApi, userApi, userStatus, companyName, showOrgRoot, single, showSelectedFooter, allowSelectAll, initialSelectedMeta, height, valueKey = 'id', labelKey = 'name', isPopup, overlayWidth, ...props }) => {
      const [usePreset] = remoteModules;
      const { apis } = usePreset();
      const resolvedOrgApi = useMemo(() => merge({}, apis.tenant?.orgList, orgApi), [apis.tenant?.orgList, orgApi]);
      const resolvedUserApi = useMemo(() => merge({}, apis.tenant?.userList, userApi), [apis.tenant?.userList, userApi]);
      const Component = callback(Target);
      return (
        <Component
          {...props}
          single={single}
          showOrgRoot={showOrgRoot}
          showSelectedFooter={showSelectedFooter}
          allowSelectAll={allowSelectAll}
          companyName={companyName}
          userStatus={userStatus}
          initialSelectedMeta={initialSelectedMeta}
          height={height}
          valueKey={valueKey}
          labelKey={labelKey}
          isPopup={isPopup}
          overlayWidth={overlayWidth}
          orgApi={resolvedOrgApi}
          userApi={resolvedUserApi}
        />
      );
    })
  );
};

const TenantUserSelect = createComponent(OrgTenantUserField);

TenantUserSelect.Field = createComponent(OrgTenantUserField, item => item.Field);

TenantUserSelect.Input = createComponent(OrgTenantUserSelectInput);
TenantUserSelect.Input.Field = createComponent(OrgTenantUserSelectInput, item => item.Field);

export default TenantUserSelect;
