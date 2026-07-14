import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { ApartmentOutlined, UserOutlined } from '@ant-design/icons';
import { Empty, Flex, Tag, Tree } from 'antd';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from '@kne/react-intl';
import buildOrgTreeData from './buildOrgTreeData';
import getOrgSelectedCounts from './getOrgSelectedCounts';
import normalizeSelectedList from './normalizeSelectedList';
import OrgTreeNodeTitle from './OrgTreeNodeTitle';
import TenantUserListPanel from './TenantUserListPanel';
import TenantUserSelectedFooter from './TenantUserSelectedFooter';
import SyncOrgList from './SyncOrgList';
import resolveInitialSelection from './resolveInitialSelection';
import mergeSelectedOrgIds, { applySelectedOrgIds } from './mergeSelectedOrgIds';
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

const TenantUserSelectFieldContext = createContext(null);

const toCssSize = value => (typeof value === 'number' ? `${value}px` : value);

const TenantUserSelectFieldControl = ({ value, onChange, disabled }) => {
  const ctx = useContext(TenantUserSelectFieldContext);
  const {
    formatMessage,
    orgApi,
    userApi,
    userStatus,
    companyName,
    showOrgRoot,
    single,
    showSelectedFooter,
    allowSelectAll,
    SimpleBar,
    initialSelectedMeta,
    height
  } = ctx;
  const containerStyle = useMemo(() => {
    if (height == null || height === '') {
      return undefined;
    }
    const size = toCssSize(height);
    return { height: size, minHeight: size, maxHeight: size };
  }, [height]);
  const [orgId, setOrgId] = useState(null);
  const [orgName, setOrgName] = useState('');
  const [orgUserTotal, setOrgUserTotal] = useState(null);
  const [orgList, setOrgList] = useState([]);
  const [orgIdByUserId, setOrgIdByUserId] = useState({});
  const handleOrgListChange = useCallback(list => {
    setOrgList(list);
  }, []);
  const initialOrgKeyRef = useRef(null);

  const orgTreeOptions = useMemo(
    () =>
      showOrgRoot
        ? { rootId: 'root', rootName: companyName || formatMessage({ id: 'UnnamedCompany' }) }
        : {},
    [showOrgRoot, companyName, formatMessage]
  );

  const userListApi = useMemo(() => {
    const statusFilter = userStatus;
    return merge({}, userApi, {
      params: merge({}, userApi?.params || {}, {
        perPage: 20,
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

  const selectedList = useMemo(() => normalizeSelectedList(value, single), [value, single]);
  const effectiveSelectedList = useMemo(
    () => applySelectedOrgIds(selectedList, orgIdByUserId),
    [orgIdByUserId, selectedList]
  );

  const handleChange = useCallback(
    next => {
      if (!single && Array.isArray(next)) {
        setOrgIdByUserId(prev => {
          const nextMap = {};
          next.forEach(item => {
            const id = String(item.id);
            const orgIdValue = item.tenantOrgId != null ? String(item.tenantOrgId) : prev[id];
            if (orgIdValue) {
              nextMap[id] = orgIdValue;
            }
          });
          return nextMap;
        });
      } else if (single && next?.id != null && next.tenantOrgId != null) {
        setOrgIdByUserId({ [String(next.id)]: String(next.tenantOrgId) });
      } else if (single && !next) {
        setOrgIdByUserId({});
      }
      onChange(next);
    },
    [onChange, single]
  );

  useEffect(() => {
    if (!initialSelectedMeta?.length) {
      return;
    }
    setOrgIdByUserId(prev => mergeSelectedOrgIds(prev, initialSelectedMeta));
  }, [initialSelectedMeta]);

  useEffect(() => {
    setOrgIdByUserId(prev => mergeSelectedOrgIds(prev, selectedList));
  }, [selectedList]);

  const selectedCountInActiveOrg = useMemo(() => {
    if (!orgId || !orgList.length) {
      return 0;
    }
    return getOrgSelectedCounts(orgList, effectiveSelectedList, null).get(String(orgId)) || 0;
  }, [effectiveSelectedList, orgId, orgList]);

  useEffect(() => {
    if (orgId || !orgList.length || !selectedList.length) {
      if (!selectedList.length) {
        initialOrgKeyRef.current = null;
      }
      return undefined;
    }

    const key = single
      ? String(value?.id)
      : selectedList
          .map(item => item.id)
          .sort()
          .join(',');

    if (initialOrgKeyRef.current === key) {
      return undefined;
    }

    let cancelled = false;

    resolveInitialSelection({
      selected: applySelectedOrgIds(selectedList, mergeSelectedOrgIds({}, initialSelectedMeta || [])),
      orgList,
      userApi
    }).then(result => {
      if (cancelled || !result?.orgId) {
        return;
      }

      initialOrgKeyRef.current = key;
      setOrgId(result.orgId);
      setOrgName(result.orgName);
      setOrgIdByUserId(prev => mergeSelectedOrgIds(prev, result.enrichedSelected));

      if (single && value && value.id != null && value.tenantOrgId == null) {
        handleChange(Object.assign({}, value, { tenantOrgId: result.orgId }));
        return;
      }

      if (!single && Array.isArray(value) && Array.isArray(result.enrichedSelected)) {
        const enriched = result.enrichedSelected;
        if (enriched.some((item, index) => item.tenantOrgId !== value[index]?.tenantOrgId)) {
          handleChange(enriched);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [handleChange, initialSelectedMeta, orgId, orgList, selectedList, single, userApi, value]);

  return (
    <div className={style.shell}>
      <div className={style.container} style={containerStyle}>
        <div className={style['org-panel']}>
          <Flex className={style['panel-header']} align="center" gap={8}>
            <ApartmentOutlined className={style['panel-header-icon']} />
            <span className={style['panel-header-title']}>{formatMessage({ id: 'TenantUserSelectOrgTitle' })}</span>
          </Flex>
          <div className={`${style['panel-body']} ${style['org-panel-body']}`}>
            <Fetch
              {...orgApi}
              render={({ data }) => {
                const list = normalizeOrgList(data);
                const treeData = buildOrgTreeData(list, orgTreeOptions);
                const orgSelectedCounts = getOrgSelectedCounts(
                  list,
                  effectiveSelectedList,
                  showOrgRoot ? orgTreeOptions.rootId : null
                );
                return (
                  <div className={style['org-panel-content']}>
                    <SyncOrgList list={list} onChange={handleOrgListChange} />
                    {!treeData.length ? (
                      <Empty
                        className={style['panel-empty']}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={formatMessage({ id: 'TenantUserSelectEmptyOrg' })}
                      />
                    ) : (
                      <SimpleBar className={`${style['panel-scroller']} ${style['org-panel-scroller']}`}>
                        <Tree
                          className={style['org-tree']}
                          blockNode
                          defaultExpandAll
                          selectedKeys={orgId ? [orgId] : []}
                          fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                          treeData={treeData}
                          titleRender={node => (
                            <OrgTreeNodeTitle
                              name={node.name}
                              selectedCount={orgSelectedCounts.get(String(node.id)) || 0}
                              single={single}
                            />
                          )}
                          onSelect={(keys, { node }) => {
                            const next = keys[0] != null ? String(keys[0]) : null;
                            if (!next || next === 'root' || next === orgId) {
                              return;
                            }
                            setOrgId(next);
                            setOrgName(node?.name || '');
                            setOrgUserTotal(null);
                            if (single) {
                              handleChange(null);
                            }
                          }}
                        />
                      </SimpleBar>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>
      <div className={style['user-panel']}>
        <Flex className={style['panel-header']} align="center" gap={8}>
          <UserOutlined className={style['panel-header-icon']} />
          <span className={style['panel-header-title']}>{formatMessage({ id: 'TenantUserSelectUserTitle' })}</span>
          {orgName ? (
            <div className={style['panel-header-meta']}>
              <Tag className={style['selected-org-tag']} color="processing">
                {orgName}
              </Tag>
              {orgUserTotal != null ? (
                <span className={style['org-member-total']}>
                  {formatMessage({ id: 'TenantUserSelectOrgMemberTotal' }, { count: orgUserTotal })}
                </span>
              ) : null}
            </div>
          ) : null}
        </Flex>
        <div className={`${style['panel-body']} ${style['user-panel-body']}`}>
          {orgId ? (
            <TenantUserListPanel
              key={orgId}
              api={userListApi}
              activeOrgId={orgId}
              single={single}
              disabled={disabled}
              value={value}
              onChange={handleChange}
              formatMessage={formatMessage}
              onTotalCountChange={setOrgUserTotal}
              selectedCountInActiveOrg={selectedCountInActiveOrg}
              allowSelectAll={allowSelectAll}
            />
          ) : (
            <div className={style['user-placeholder']}>
              <UserOutlined className={style['user-placeholder-icon']} />
              <div className={style['user-placeholder-text']}>
                {formatMessage({ id: 'TenantUserSelectSelectOrgFirst' })}
              </div>
            </div>
          )}
        </div>
        {showSelectedFooter ? (
          <TenantUserSelectedFooter
            value={value}
            onChange={handleChange}
            single={single}
            disabled={disabled}
            formatMessage={formatMessage}
          />
        ) : null}
      </div>
      </div>
    </div>
  );
};

const OrgTenantUserField = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks', 'components-core:Common@SimpleBar']
})(
  withLocale(({ remoteModules, orgApi, userApi, userStatus, companyName, showOrgRoot = true, single = true, showSelectedFooter = true, allowSelectAll = true, initialSelectedMeta, height, ...props }) => {
    const [hooks, SimpleBar] = remoteModules;
    const { useDecorator } = hooks;
    const { formatMessage } = useIntl();
    const fieldProps = omit(props, [
      'remoteModules',
      'orgApi',
      'userApi',
      'userStatus',
      'companyName',
      'showOrgRoot',
      'single',
      'showSelectedFooter',
      'allowSelectAll',
      'initialSelectedMeta',
      'height'
    ]);
    const render = useDecorator(
      merge(
        {
          interceptor: single ? 'object-output-value' : 'array-output-value'
        },
        fieldProps
      )
    );

    const contextValue = useMemo(
      () => ({
        formatMessage,
        orgApi,
        userApi,
        userStatus,
        companyName,
        showOrgRoot,
        single,
        showSelectedFooter,
        allowSelectAll,
        initialSelectedMeta,
        height,
        SimpleBar
      }),
      [formatMessage, orgApi, userApi, userStatus, companyName, showOrgRoot, single, showSelectedFooter, allowSelectAll, initialSelectedMeta, height, SimpleBar]
    );

    return (
      <TenantUserSelectFieldContext.Provider value={contextValue}>
        {render(TenantUserSelectFieldControl)}
      </TenantUserSelectFieldContext.Provider>
    );
  })
);

export default OrgTenantUserField;
