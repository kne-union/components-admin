import { Checkbox, Flex } from 'antd';
import { useMemo, useState } from 'react';
import { fetchAllOrgUsers, mapUserToSelectedValue } from './fetchAllOrgUsers';
import style from './style.module.scss';

const TenantUserListSelectAll = ({
  checked,
  indeterminate,
  disabled,
  loading,
  formatMessage,
  onChange
}) => {
  return (
    <Flex className={style['user-list-toolbar']} align="center" gap={10}>
      <Checkbox
        className={style['user-list-toolbar-checkbox']}
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled || loading}
        onChange={event => onChange(event.target.checked)}
      />
      <span className={style['user-list-toolbar-label']}>{formatMessage({ id: 'TenantUserSelectSelectAll' })}</span>
    </Flex>
  );
};

const TenantUserListSelectAllContainer = ({
  api,
  total,
  activeOrgId,
  value,
  onChange,
  disabled,
  formatMessage,
  selectedCountInActiveOrg
}) => {
  const [loading, setLoading] = useState(false);

  const selectAllState = useMemo(() => {
    if (!total) {
      return { checked: false, indeterminate: false };
    }
    if (selectedCountInActiveOrg >= total) {
      return { checked: true, indeterminate: false };
    }
    if (selectedCountInActiveOrg > 0) {
      return { checked: false, indeterminate: true };
    }
    return { checked: false, indeterminate: false };
  }, [selectedCountInActiveOrg, total]);

  const handleSelectAll = async checked => {
    if (disabled || loading) {
      return;
    }
    const current = Array.isArray(value) ? value : [];
    setLoading(true);
    try {
      const allUsers = await fetchAllOrgUsers(api, total);
      const currentOrgIds = new Set(allUsers.map(item => String(item.id)));
      if (!checked) {
        onChange(current.filter(item => !currentOrgIds.has(String(item.id))));
        return;
      }
      const merged = [...current];
      allUsers.forEach(item => {
        const nextValue = mapUserToSelectedValue(item, activeOrgId);
        if (!merged.some(existing => String(existing.id) === String(nextValue.id))) {
          merged.push(nextValue);
        }
      });
      onChange(merged);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TenantUserListSelectAll
      checked={selectAllState.checked}
      indeterminate={selectAllState.indeterminate}
      disabled={disabled}
      loading={loading}
      formatMessage={formatMessage}
      onChange={handleSelectAll}
    />
  );
};

export default TenantUserListSelectAllContainer;
