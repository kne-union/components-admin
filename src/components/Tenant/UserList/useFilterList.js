import { useMemo } from 'react';
import merge from 'lodash/merge';
import getRoleListApi from '../Role/getRoleListApi';

const useFilterList = ({
  formatMessage,
  apis,
  InputFilterItem,
  SuperSelectFilterItem,
  SelectTreeFilterItem,
  multiSelectInterceptor,
  singleSelectInterceptor
}) => {
  return useMemo(
    () => [
      {
        type: InputFilterItem,
        props: {
          key: 'id',
          label: formatMessage({ id: 'FilterUserId' }),
          name: 'id'
        }
      },
      {
        type: SuperSelectFilterItem,
        props: {
          key: 'roles',
          label: formatMessage({ id: 'UserRole' }),
          name: 'roles',
          valueKey: 'id',
          labelKey: 'name',
          interceptor: multiSelectInterceptor,
          api: getRoleListApi(apis)
        }
      },
      {
        type: SelectTreeFilterItem,
        props: {
          key: 'tenantOrgId',
          label: formatMessage({ id: 'Department' }),
          name: 'tenantOrgId',
          single: true,
          valueKey: 'id',
          labelKey: 'name',
          parentKey: 'parentId',
          interceptor: singleSelectInterceptor,
          api: merge({}, apis.orgList, { params: apis.orgList?.params || {} })
        }
      },
      {
        type: SuperSelectFilterItem,
        props: {
          key: 'status',
          label: formatMessage({ id: 'FilterStatus' }),
          name: 'status',
          single: true,
          api: {
            loader: () => ({
              pageData: [
                { label: formatMessage({ id: 'Open' }), value: 'open' },
                { label: formatMessage({ id: 'Close' }), value: 'closed' }
              ]
            })
          }
        }
      },
      {
        type: SuperSelectFilterItem,
        props: {
          key: 'synced',
          label: formatMessage({ id: 'FilterSynced' }),
          name: 'synced',
          single: true,
          allowClear: true,
          api: {
            loader: () => ({
              pageData: [
                { label: formatMessage({ id: 'Yes' }), value: 'true' },
                { label: formatMessage({ id: 'No' }), value: 'false' }
              ]
            })
          }
        }
      }
    ],
    [
      formatMessage,
      apis.roleList,
      apis.orgList,
      InputFilterItem,
      SuperSelectFilterItem,
      SelectTreeFilterItem,
      multiSelectInterceptor,
      singleSelectInterceptor
    ]
  );
};

export default useFilterList;
