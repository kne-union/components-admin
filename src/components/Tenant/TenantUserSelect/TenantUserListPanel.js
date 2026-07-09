import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { CheckOutlined } from '@ant-design/icons';
import { Avatar, Checkbox, Empty, Flex } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import merge from 'lodash/merge';
import { useEffect, useMemo } from 'react';
import { mapUserToSelectedValue } from './fetchAllOrgUsers';
import TenantUserListSelectAll from './TenantUserListSelectAll';
import style from './style.module.scss';

const TotalCountReporter = ({ total, onTotalCountChange }) => {
  useEffect(() => {
    if (typeof onTotalCountChange === 'function') {
      onTotalCountChange(total);
    }
  }, [total, onTotalCountChange]);

  return null;
};

const PAGE_SIZE = 20;

const pagination = {
  paramsType: 'params',
  current: 'currentPage',
  pageSizeName: 'perPage',
  pageSize: PAGE_SIZE
};

const getSelectedIds = (value, single) => {
  if (!value) {
    return [];
  }
  if (single) {
    return value.id != null ? [String(value.id)] : [];
  }
  return (Array.isArray(value) ? value : []).map(item => String(item.id));
};

const getUserDescription = item => [item.position, item.department].filter(Boolean).join(' · ') || item.email;

const TenantUserListPanel = createWithRemoteLoader({
  modules: ['components-core:Common@ScrollLoader']
})(
  ({
    remoteModules,
    api,
    value,
    onChange,
    single,
    disabled,
    formatMessage,
    activeOrgId,
    onTotalCountChange,
    selectedCountInActiveOrg,
    allowSelectAll = true
  }) => {
    const [ScrollLoader] = remoteModules;
    const selectedIds = useMemo(() => getSelectedIds(value, single), [value, single]);

    const handleSelect = item => {
      if (disabled) {
        return;
      }
      const itemValue = mapUserToSelectedValue(item, activeOrgId);
      if (single) {
        onChange(itemValue);
        return;
      }
      const current = Array.isArray(value) ? value : [];
      const exists = current.some(v => String(v.id) === String(item.id));
      onChange(
        exists ? current.filter(v => String(v.id) !== String(item.id)) : [...current, itemValue]
      );
    };

    return (
      <div className={style['user-list-panel']}>
        <Fetch
          {...api}
          render={fetchApi => {
          const current = get(fetchApi.requestParams, [pagination.paramsType, pagination.current], 1);
          const pageSize =
            get(fetchApi.requestParams, [pagination.paramsType, pagination.pageSizeName]) || pagination.pageSize;
          const list = fetchApi.data?.pageData || [];
          const total = fetchApi.data?.totalCount || 0;

          if (!fetchApi.isComplete && !list.length) {
            return <TotalCountReporter total={null} onTotalCountChange={onTotalCountChange} />;
          }

          if (fetchApi.isComplete && !list.length) {
            return (
              <>
                <TotalCountReporter total={total} onTotalCountChange={onTotalCountChange} />
                <Empty
                  className={style['panel-empty']}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={formatMessage({ id: 'TenantUserSelectEmptyUser' })}
                />
              </>
            );
          }

          return (
            <div className={style['user-list-panel-content']}>
              <TotalCountReporter total={total} onTotalCountChange={onTotalCountChange} />
              {!single && allowSelectAll && total > 0 ? (
                <TenantUserListSelectAll
                  api={api}
                  total={total}
                  activeOrgId={activeOrgId}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                  formatMessage={formatMessage}
                  selectedCountInActiveOrg={selectedCountInActiveOrg}
                />
              ) : null}
              <ScrollLoader
                className={`${style['panel-scroller']} ${style['user-list-scroll']}`}
                completeTips=""
                isLoading={!fetchApi.isComplete}
                noMore={!total || current * pageSize >= total}
                onLoader={async () => {
                  await fetchApi.loadMore(
                    merge({
                      [pagination.paramsType]: {
                        [pagination.pageSizeName]: pageSize,
                        [pagination.current]: current + 1
                      }
                    }),
                    (data, newData) =>
                      Object.assign({}, newData, {
                        pageData: (data.pageData || []).concat(newData.pageData || [])
                      })
                  );
                }}
              >
                <div className={style['user-list-scroll-inner']}>
                  <div className={style['user-list']}>
                    {list.map(item => {
                    const selected = selectedIds.includes(String(item.id));
                    const description = getUserDescription(item);
                    return (
                      <div
                        key={item.id}
                        className={classnames(style['user-list-item'], {
                          [style['user-list-item-selected']]: selected,
                          [style['user-list-item-disabled']]: disabled
                        })}
                        onClick={() => handleSelect(item)}
                      >
                        {!single ? (
                          <Checkbox className={style['user-list-checkbox']} checked={selected} disabled={disabled} />
                        ) : null}
                        <Avatar className={style['user-list-avatar']} src={item.avatar} size={36}>
                          {item.name?.[0]}
                        </Avatar>
                        <Flex className={style['user-list-content']} vertical gap={2}>
                          <div className={style['user-list-name']}>{item.name}</div>
                          {description ? <div className={style['user-list-desc']}>{description}</div> : null}
                        </Flex>
                        {single && selected ? <CheckOutlined className={style['user-list-check']} /> : null}
                      </div>
                    );
                    })}
                  </div>
                </div>
              </ScrollLoader>
            </div>
          );
        }}
      />
      </div>
    );
  }
);

export default TenantUserListPanel;
