import { Tag, Tooltip } from 'antd';
import get from 'lodash/get';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import CardList from '@components/MailGateway/CardList';
import withLocale from '../withLocale';
import Actions from './Actions';
import { buildPersonalCardProps } from './UserPersonalCard';
import { getSourceIcon, getSourceLabel } from '../constants';
import style from './UserMobileList.module.scss';

const resolveRowId = (item, rowKey = 'id') => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);

const SourceTag = ({ source }) => (
  <Tooltip title={source}>
    <Tag className={style.sourceTag} icon={getSourceIcon(source)} color="processing">
      {getSourceLabel(source)}
    </Tag>
  </Tooltip>
);

/**
 * 租户用户列表卡片：与用户管理、消息管理共用 CardList，PC 卡片视图为网格，移动端单列
 */
const UserMobileList = createWithRemoteLoader({
  modules: ['components-core:Image', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, dataSource = [], rowKey = 'id', layout, rowSelection, apis, getActions, onSuccess, showLength }) => {
    const [Image, usePreset] = remoteModules;
    const { plugins } = usePreset();
    const { formatMessage } = useIntl();
    const selectedRowKeys = rowSelection?.selectedRowKeys || [];

    const toggleSelect = (item, id, isChecked) => {
      if (!rowSelection || item.disabled || rowSelection.isSelectedAll) {
        return;
      }
      const checked = !isChecked;
      // useSelectedRow 返回 onSelect；getRowSelection / adaptRowSelection 才有 onChange
      if (typeof rowSelection.onSelect === 'function') {
        rowSelection.onSelect(item, checked);
        return;
      }
      if (typeof rowSelection.onChange !== 'function') {
        return;
      }
      if (rowSelection.type === 'radio') {
        rowSelection.onChange(isChecked ? [] : [id], id, { checked });
        return;
      }
      const nextKeys = isChecked ? selectedRowKeys.filter(key => key !== id) : [...selectedRowKeys, id];
      rowSelection.onChange(nextKeys, id, { checked });
    };

    return (
      <CardList
        dataSource={dataSource || []}
        getRowKey={item => resolveRowId(item, rowKey)}
        layout={layout}
        rowSelection={rowSelection?.type === 'checkbox' ? rowSelection : null}
        getSelectionProps={item => {
          const id = resolveRowId(item, rowKey);
          const isChecked = selectedRowKeys.indexOf(id) > -1;
          return {
            checked: (rowSelection.isSelectedAll && !item.disabled) || isChecked,
            disabled: item.disabled || rowSelection.isSelectedAll,
            onChange: () => toggleSelect(item, id, isChecked)
          };
        }}
        renderItem={item => {
          const { moreInfo, description, avatar } = buildPersonalCardProps(item, { Image, formatMessage, plugins });
          return {
            leading: avatar({ className: style.avatar, size: 40 }),
            title: item.name || item.email || item.phone || '-',
            extra: item.syncSource ? <SourceTag source={item.syncSource} /> : null,
            description,
            fields: [
              // 单个部门且不显示路径时 PersonalCard 的 label 与 content 都是部门名
              ...(moreInfo || []).map(info => ({
                label: info.label === info.content ? formatMessage({ id: 'Department' }) : info.label,
                value: info.content
              })),
              item.email && { label: formatMessage({ id: 'Email' }), value: item.email },
              item.phone && { label: formatMessage({ id: 'Phone' }), value: item.phone }
            ].filter(Boolean),
            actions: (
              <div className={style.actions}>
                <Actions
                  place="end"
                  type="link"
                  itemClassName="btn-no-padding"
                  moreType="link"
                  showLength={showLength}
                  data={item}
                  apis={apis}
                  onSuccess={onSuccess}
                >
                  {getActions}
                </Actions>
              </div>
            )
          };
        }}
      />
    );
  })
);

export default UserMobileList;
