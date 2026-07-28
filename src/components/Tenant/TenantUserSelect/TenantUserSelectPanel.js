import Fetch from '@kne/react-fetch';
import { ApartmentOutlined, UserOutlined } from '@ant-design/icons';
import { Empty, Flex, Tag, Tree } from 'antd';
import classnames from 'classnames';
import merge from 'lodash/merge';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import buildOrgTreeData from './buildOrgTreeData';
import getOrgSelectedCounts from './getOrgSelectedCounts';
import normalizeSelectedList from './normalizeSelectedList';
import OrgTreeNodeTitle from './OrgTreeNodeTitle';
import TenantUserListPanel from './TenantUserListPanel';
import TenantUserSelectedFooter from './TenantUserSelectedFooter';
import SyncOrgList from './SyncOrgList';
import resolveInitialSelection from './resolveInitialSelection';
import mergeSelectedOrgIds, { applySelectedOrgIds } from './mergeSelectedOrgIds';
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

const toCssSize = value => (typeof value === 'number' ? `${value}px` : value);

const TenantUserSelectPanel = ({
  value,
  onChange,
  onSelectComplete,
  disabled,
  formatMessage,
  orgApi,
  userApi,
  userStatus,
  companyName,
  showOrgRoot = true,
  single = true,
  showSelectedFooter = true,
  allowSelectAll = true,
  initialSelectedMeta,
  height,
  valueKey = 'id',
  labelKey = 'name',
  className
}) => {
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

  const normalizedValue = useMemo(() => {
    if (!value) {
      return value;
    }
    if (single) {
      if (value && typeof value === 'object') {
        return Object.assign({}, value, {
          id: value.id ?? value?.[valueKey],
          name: value.name ?? value?.[labelKey]
        });
      }
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(item => {
        if (!item || typeof item !== 'object') {
          if (typeof item === 'string' || typeof item === 'number') {
            return { id: String(item), name: '' };
          }
          return item;
        }
        return Object.assign({}, item, {
          id: item.id ?? item?.[valueKey],
          name: item.name ?? item?.[labelKey]
        });
      });
    }
    return value;
  }, [value, single, valueKey, labelKey]);

  const normalizedInitialSelectedMeta = useMemo(() => {
    if (!Array.isArray(initialSelectedMeta)) {
      return initialSelectedMeta;
    }
    return initialSelectedMeta.map(item => {
      if (!item || typeof item !== 'object') {
        return item;
      }
      return Object.assign({}, item, {
        id: item.id ?? item?.[valueKey],
        name: item.name ?? item?.[labelKey]
      });
    });
  }, [initialSelectedMeta, valueKey, labelKey]);

  const selectedList = useMemo(() => normalizeSelectedList(normalizedValue, single), [normalizedValue, single]);
  const initialSelectedList = useMemo(
    () => normalizeSelectedList(single ? normalizedInitialSelectedMeta?.[0] : normalizedInitialSelectedMeta, single),
    [normalizedInitialSelectedMeta, single]
  );
  const effectiveValue = useMemo(() => {
    if (selectedList.length > 0) {
      return normalizedValue;
    }
    if (initialSelectedList.length === 0) {
      return normalizedValue;
    }
    return single ? initialSelectedList[0] : initialSelectedList;
  }, [initialSelectedList, normalizedValue, selectedList, single]);
  const effectiveSelectedListForDisplay = useMemo(
    () => (selectedList.length > 0 ? selectedList : initialSelectedList),
    [initialSelectedList, selectedList]
  );
  const effectiveSelectedList = useMemo(
    () => applySelectedOrgIds(effectiveSelectedListForDisplay, orgIdByUserId),
    [effectiveSelectedListForDisplay, orgIdByUserId]
  );

  const handleChange = useCallback(
    (next, meta) => {
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
      // 仅成员列表主动点选时通知完成，避免切组织清空/回填误关下拉
      if (meta?.source === 'user' && typeof onSelectComplete === 'function') {
        onSelectComplete(next);
      }
    },
    [onChange, onSelectComplete, single]
  );

  useEffect(() => {
    if (!normalizedInitialSelectedMeta?.length) {
      return;
    }
    setOrgIdByUserId(prev => mergeSelectedOrgIds(prev, normalizedInitialSelectedMeta));
  }, [normalizedInitialSelectedMeta]);

  useEffect(() => {
    if (selectedList.length > 0 || initialSelectedList.length === 0) {
      return;
    }
    onChange(single ? initialSelectedList[0] : initialSelectedList);
  }, [initialSelectedList, onChange, selectedList, single]);

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
    if (orgId || !orgList.length || !effectiveSelectedListForDisplay.length) {
      if (!effectiveSelectedListForDisplay.length) {
        initialOrgKeyRef.current = null;
      }
      return undefined;
    }

    const key = single
      ? String(effectiveValue?.id)
      : effectiveSelectedListForDisplay
          .map(item => item.id)
          .sort()
          .join(',');

    if (initialOrgKeyRef.current === key) {
      return undefined;
    }

    let cancelled = false;

    resolveInitialSelection({
      selected: applySelectedOrgIds(effectiveSelectedListForDisplay, mergeSelectedOrgIds({}, normalizedInitialSelectedMeta || [])),
      orgList,
      userApi,
      valueKey
    }).then(result => {
      if (cancelled || !result?.orgId) {
        return;
      }

      initialOrgKeyRef.current = key;
      setOrgId(result.orgId);
      setOrgName(result.orgName);
      setOrgIdByUserId(prev => mergeSelectedOrgIds(prev, result.enrichedSelected));

      if (single && effectiveValue && effectiveValue.id != null && effectiveValue.tenantOrgId == null) {
        handleChange(Object.assign({}, effectiveValue, { tenantOrgId: result.orgId }));
        return;
      }

      if (!single && Array.isArray(effectiveValue) && Array.isArray(result.enrichedSelected)) {
        const enriched = result.enrichedSelected;
        if (enriched.some((item, index) => item.tenantOrgId !== effectiveValue[index]?.tenantOrgId)) {
          handleChange(enriched);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [effectiveSelectedListForDisplay, effectiveValue, handleChange, normalizedInitialSelectedMeta, orgId, orgList, single, userApi, valueKey]);

  return (
    <div className={classnames(style.shell, className)}>
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
                      <div className={`${style['panel-scroller']} ${style['org-panel-scroller']}`}>
                        <Tree
                          className={style['org-tree']}
                          blockNode
                          defaultExpandAll
                          selectedKeys={orgId ? [orgId] : []}
                          fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                          treeData={treeData}
                          titleRender={node => {
                            let userCount = Number(node.userCount) || 0;
                            if (showOrgRoot && String(node.id) === String(orgTreeOptions.rootId)) {
                              userCount = list
                                .filter(item => item.parentId == null || item.parentId === '')
                                .reduce((sum, item) => sum + (Number(item.userCount) || 0), 0);
                            }
                            return (
                              <OrgTreeNodeTitle
                                name={node.name}
                                userCount={userCount}
                                selectedCount={orgSelectedCounts.get(String(node.id)) || 0}
                              />
                            );
                          }}
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
                      </div>
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
                value={effectiveValue}
                onChange={next => handleChange(next, { source: 'user' })}
                formatMessage={formatMessage}
                onTotalCountChange={setOrgUserTotal}
                selectedCountInActiveOrg={selectedCountInActiveOrg}
                allowSelectAll={allowSelectAll}
                valueKey={valueKey}
                labelKey={labelKey}
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
              value={effectiveValue}
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

export default TenantUserSelectPanel;
