import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, List, Space, Tag } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, CheckCircleFilled, CheckCircleOutlined } from '@ant-design/icons';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';

/** 已选按 selected 顺序在前，未选跟在后面 */
export const orderLanguageOptions = (options = [], selected = []) => {
  const map = new Map((options || []).map(item => [item.value, item]));
  const selectedOrdered = [];
  const selectedSet = new Set();
  (selected || []).forEach(code => {
    const option = map.get(code);
    if (option) {
      selectedOrdered.push(option);
      selectedSet.add(code);
    }
  });
  const unselected = (options || []).filter(item => !selectedSet.has(item.value));
  return selectedOrdered.concat(unselected);
};

const moveSelected = (selected, value, direction) => {
  const index = selected.indexOf(value);
  if (index < 0) {
    return selected;
  }
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= selected.length) {
    return selected;
  }
  const next = selected.slice();
  const tmp = next[index];
  next[index] = next[targetIndex];
  next[targetIndex] = tmp;
  return next;
};

const CheckListField = props => {
  const { value, onChange, options = [] } = props;
  const { formatMessage } = useIntl();
  const selected = value?.selected || [];
  const defaultLang = value?.default || '';
  const orderedOptions = orderLanguageOptions(options, selected);

  const handleToggle = option => {
    const isSelected = selected.includes(option.value);
    if (isSelected) {
      if (selected.length <= 1) return;
      const newSelected = selected.filter(v => v !== option.value);
      const newDefault = defaultLang === option.value ? '' : defaultLang;
      onChange({ selected: newSelected, default: newDefault });
    } else {
      onChange({ selected: [...selected, option.value], default: defaultLang });
    }
  };

  const handleSetDefault = (e, option) => {
    e.stopPropagation();
    if (!selected.includes(option.value)) return;
    onChange({ selected, default: defaultLang === option.value ? '' : option.value });
  };

  const handleMove = (e, option, direction) => {
    e.stopPropagation();
    if (!selected.includes(option.value)) return;
    const nextSelected = moveSelected(selected, option.value, direction);
    if (nextSelected === selected) return;
    onChange({ selected: nextSelected, default: defaultLang });
  };

  return (
    <List
      bordered
      dataSource={orderedOptions}
      renderItem={option => {
        const isSelected = selected.includes(option.value);
        const isDefault = defaultLang === option.value;
        const selectedIndex = selected.indexOf(option.value);
        const canMoveUp = isSelected && selectedIndex > 0;
        const canMoveDown = isSelected && selectedIndex >= 0 && selectedIndex < selected.length - 1;
        return (
          <List.Item
            style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            onClick={() => handleToggle(option)}
          >
            <span style={{ pointerEvents: 'none' }}>{option.label}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isSelected && (
                <Space size={0} onClick={e => e.stopPropagation()}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={!canMoveUp}
                    aria-label={formatMessage({ id: 'MoveUp' })}
                    onClick={e => handleMove(e, option, 'up')}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={!canMoveDown}
                    aria-label={formatMessage({ id: 'MoveDown' })}
                    onClick={e => handleMove(e, option, 'down')}
                  />
                </Space>
              )}
              {isSelected && (
                <Tag color={isDefault ? 'blue' : 'default'} style={{ margin: 0, cursor: 'pointer' }} onClick={e => handleSetDefault(e, option)}>
                  {isDefault ? formatMessage({ id: 'DefaultTag' }) : formatMessage({ id: 'SetDefault' })}
                </Tag>
              )}
              {isSelected ? (
                <CheckCircleFilled style={{ color: 'var(--primary-color)', fontSize: 18, flexShrink: 0, pointerEvents: 'none' }} />
              ) : (
                <CheckCircleOutlined style={{ color: '#d9d9d9', fontSize: 18, flexShrink: 0, pointerEvents: 'none' }} />
              )}
            </span>
          </List.Item>
        );
      }}
    />
  );
};

const LanguageCheckList = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules, ...props }) => {
    const [FormInfo] = remoteModules;
    const { useOnChange } = FormInfo.hooks;
    const render = useOnChange(props);
    return render(CheckListField);
  })
);

export default LanguageCheckList;
