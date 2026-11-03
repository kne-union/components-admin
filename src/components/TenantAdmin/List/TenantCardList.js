import { Avatar, Tag } from 'antd';
import dayjs from 'dayjs';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import { isManagedTenant } from '@components/Tenant';
import CardList from '@components/MailGateway/CardList';
import withLocale from '../withLocale';
import Actions from '../Actions';
import style from './style.module.scss';

const formatDate = (value, format) => (value ? dayjs(value).format(format) : '');

// 与用户管理、消息管理共用 CardList：整卡点击进入详情，操作在底栏
const TenantCardList = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup', 'components-core:Image']
})(
  withLocale(({ remoteModules, dataSource = [], layout, showLength, onDetail, onSuccess }) => {
    const [ButtonGroup, Image] = remoteModules;
    const { formatMessage } = useIntl();

    return (
      <CardList
        dataSource={dataSource || []}
        getRowKey={item => item.id}
        layout={layout}
        renderItem={item => {
          const serviceTime = [formatDate(item.serviceStartTime, 'YYYY-MM-DD'), formatDate(item.serviceEndTime, 'YYYY-MM-DD')]
            .filter(Boolean)
            .join(' ~ ');
          return {
            onClick: () => onDetail(item),
            leading: item.logo ? (
              <Image.Avatar className={style.logo} id={item.logo} size={40} shape="square" />
            ) : (
              <Avatar className={style.logo} size={40} shape="square">
                {String(item.name || '-').slice(0, 1)}
              </Avatar>
            ),
            title: item.name || '-',
            extra: (
              <>
                <Tag color={isManagedTenant(item) ? 'processing' : 'default'}>
                  {formatMessage({ id: isManagedTenant(item) ? 'ManagedByHost' : 'LocalTenant' })}
                </Tag>
                <Tag color={item.status === 'open' ? 'success' : 'error'}>{formatMessage({ id: item.status === 'open' ? 'Open' : 'Close' })}</Tag>
              </>
            ),
            muted: item.status !== 'open',
            description: typeof item.description === 'string' ? item.description.trim() : undefined,
            fields: [
              { label: 'ID', value: item.id },
              serviceTime && { label: formatMessage({ id: 'ServiceTime' }), value: serviceTime },
              item.accountCount != null && { label: formatMessage({ id: 'AccountCountTag' }), value: item.accountCount },
              { label: formatMessage({ id: 'CreatedAt' }), value: formatDate(item.createdAt, 'YYYY-MM-DD HH:mm') || '-' }
            ].filter(Boolean),
            // 宿主同步的租户没有可用操作
            actions: isManagedTenant(item) ? null : (
              <Actions data={item} onSuccess={onSuccess}>
                {({ list }) => (
                  <div className={style.actions}>
                    <ButtonGroup
                      place="end"
                      itemClassName="btn-no-padding"
                      moreType="link"
                      showLength={showLength}
                      list={list.filter(action => !action.hidden).map(action => Object.assign({}, action, { type: 'link' }))}
                    />
                  </div>
                )}
              </Actions>
            )
          };
        }}
      />
    );
  })
);

export default TenantCardList;
