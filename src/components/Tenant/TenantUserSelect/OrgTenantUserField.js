import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { Empty, Tree } from 'antd';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { useMemo, useState } from 'react';
import { useIntl } from '@kne/react-intl';
import buildOrgTreeData from './buildOrgTreeData';
import withLocale from '../withLocale';
import style from './style.module.scss';

const normalizeOrgList = data => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data?.pageData) {
    return data.pageData;
  }
  return [];
};

const OrgTenantUserField = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules, orgApi, userApi, userStatus, companyName, showOrgRoot = true, single = true, ...props }) => {
  const [FormInfo] = remoteModules;
  const { useDecorator, fields } = FormInfo;
  const { SuperSelect } = fields;
  const { formatMessage } = useIntl();
  const fieldProps = omit(props, ['remoteModules', 'orgApi', 'userApi', 'userStatus', 'companyName', 'showOrgRoot', 'single']);
  const render = useDecorator(fieldProps);
  const [orgId, setOrgId] = useState(null);

  const InnerControl = ({ value, onChange, disabled }) => {
    const userSelectApi = useMemo(() => {
      const statusFilter = userStatus;
      return merge({}, userApi, {
        params: merge({}, userApi?.params || {}, {
          perPage: 100,
          currentPage: 1,
          filter: merge(
            {},
            userApi?.params?.filter || {},
            statusFilter ? { status: statusFilter } : {},
            orgId ? { tenantOrgId: orgId } : {}
          )
        }),
        ready: !!orgId
      });
    }, [orgId, userApi, userStatus]);

    return (
      <div className={style.container}>
        <div className={style['org-panel']}>
          <div className={style['org-title']}>{formatMessage({ id: 'TenantUserSelectOrgTitle' })}
          </div>
          <Fetch
            {...orgApi}
            render={({ data }) => {
              const list = normalizeOrgList(data);
              const treeData = buildOrgTreeData(
                list,
                showOrgRoot ? { rootId: 'root', rootName: companyName || formatMessage({ id: 'UnnamedCompany' }) } : {}
              );
              if (!treeData.length) {
                return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'TenantUserSelectEmptyOrg' })} />;
              }
              return (
                <Tree
                  className={style['org-tree']}
                  blockNode
                  defaultExpandAll
                  selectedKeys={orgId ? [orgId] : []}
                  fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                  treeData={treeData}
                  onSelect={keys => {
                    const next = keys[0] != null ? String(keys[0]) : null;
                    if (!next || next === 'root') {
                      return;
                    }
                    setOrgId(next);
                    onChange(single ? null : []);
                  }}
                />
              );
            }}
          />
        </div>
        <div className={style['user-panel']}>
          <div className={style['user-title']}>{formatMessage({ id: 'TenantUserSelectUserTitle' })}</div>
          <SuperSelect
            key={orgId || 'no-org'}
            className={style['user-select']}
            labelHidden
            block
            disabled={disabled || !orgId}
            single={single}
            value={value}
            onChange={onChange}
            placeholder={
              orgId
                ? fieldProps.placeholder || formatMessage({ id: 'TenantUserSelectPlaceholder' })
                : formatMessage({ id: 'TenantUserSelectSelectOrgFirst' })
            }
            api={userSelectApi}
            interceptor={single ? 'object-output-value' : 'array-output-value'}
            valueKey="id"
            labelKey="name"
          />
        </div>
      </div>
    );
  };

  return render(InnerControl);
}));

export default OrgTenantUserField;
