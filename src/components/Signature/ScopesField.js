import { Flex, Tag } from 'antd';
import { useIntl } from '@kne/react-intl';
import { getMethodTagColor } from './openApiScopes';
import withLocale from './withLocale';
import style from './style.module.scss';

/** SuperSelect 列表项：method 用 Tag 着色，旁路 path + summary */
export const renderScopeItemContent = ({ item }) => {
  const method = item?.method || String(item?.value || '').split(' ')[0];
  const path = item?.path || String(item?.value || '').split(' ').slice(1).join(' ');
  return (
    <Flex vertical gap={2} className={style['scope-item']}>
      <Flex align="center" gap={8} className={style['scope-item-main']}>
        <Tag color={getMethodTagColor(method)} className={style['scope-method-tag']}>
          {method}
        </Tag>
        <span className={style['scope-path']}>{path}</span>
      </Flex>
      {item?.description ? <div className={style['scope-summary']}>{item.description}</div> : null}
    </Flex>
  );
};

/** 表单内作用域 SuperSelect 字段（多选，未选=不限制）
 * api 模式下须用 getSearchProps 才会渲染搜索框（getSearchCallback 仅对 options 生效）
 */
const ScopesField = withLocale(({ SuperSelect, api, ...props }) => {
  const { formatMessage } = useIntl();
  return (
    <SuperSelect
      name="scopes"
      label={formatMessage({ id: 'Scopes' })}
      tips={formatMessage({ id: 'ScopesTips' })}
      placeholder={formatMessage({ id: 'ScopesPlaceholder' })}
      searchPlaceholder={formatMessage({ id: 'ScopesPlaceholder' })}
      api={api}
      isPopup
      renderItemContent={renderScopeItemContent}
      getSearchProps={({ searchText }) => (searchText ? { searchText } : {})}
      {...props}
    />
  );
});

export default ScopesField;
