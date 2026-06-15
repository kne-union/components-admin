import { useMemo } from 'react';
import merge from 'lodash/merge';
import DepartmentTreeFilterItem from './DepartmentTreeFilterItem';
import getRoleListApi from '../Role/getRoleListApi';

const useFilterList = ({ formatMessage, apis, InputFilterItem, SuperSelectFilterItem, multiSelectInterceptor }) => {
  return useMemo(
    () => [
      [
        <InputFilterItem key="id" label={formatMessage({ id: 'FilterUserId' })} name="id" />,
        <SuperSelectFilterItem
          key="roles"
          label={formatMessage({ id: 'UserRole' })}
          name="roles"
          valueKey="id"
          labelKey="name"
          interceptor={multiSelectInterceptor}
          api={getRoleListApi(apis)}
        />,
        <DepartmentTreeFilterItem
          key="tenantOrgId"
          label={formatMessage({ id: 'Department' })}
          name="tenantOrgId"
          api={merge({}, apis.orgList, { params: apis.orgList?.params || {} })}
        />,
        <SuperSelectFilterItem
          key="status"
          label={formatMessage({ id: 'FilterStatus' })}
          name="status"
          single
          api={{
            loader: () => ({
              pageData: [
                { label: formatMessage({ id: 'Open' }), value: 'open' },
                { label: formatMessage({ id: 'Close' }), value: 'closed' }
              ]
            })
          }}
        />,
        <SuperSelectFilterItem
          key="synced"
          label={formatMessage({ id: 'FilterSynced' })}
          name="synced"
          single
          allowClear
          api={{
            loader: () => ({
              pageData: [
                { label: formatMessage({ id: 'Yes' }), value: 'true' },
                { label: formatMessage({ id: 'No' }), value: 'false' }
              ]
            })
          }}
        />
      ]
    ],
    [formatMessage, apis.roleList, apis.orgList, InputFilterItem, SuperSelectFilterItem]
  );
};

export default useFilterList;
