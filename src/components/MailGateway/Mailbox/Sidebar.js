import { createWithRemoteLoader } from '@kne/remote-loader';
import { Badge, Button, Divider, Flex, Select } from 'antd';
import { useIntl } from '@kne/react-intl';
import classnames from 'classnames';
import { DeleteOutlined, EditOutlined, FormOutlined, InboxOutlined, SendOutlined, TagsOutlined } from '@ant-design/icons';
import withLocale from '../withLocale';
import AppMenu from '../Menu';
import style from '../style.module.scss';

const MAX_COUNT = 999;

const formatCount = count => (count > MAX_COUNT ? `${MAX_COUNT}+` : String(count));

const MenuLabel = ({ text, count, color, danger }) => (
  <Flex align="center" justify="space-between" gap={8} className={style['sidebar-item']}>
    <Flex align="center" gap={6} className={style['sidebar-item-text']}>
      {color && <span className={style['label-dot']} style={{ background: color }} />}
      <span>{text}</span>
    </Flex>
    {(typeof count === 'string' || count > 0) && (
      <Badge className={classnames(style['sidebar-badge'], { [style['is-danger']]: danger })} count={count} size="small" overflowCount={MAX_COUNT} />
    )}
  </Flex>
);

// 有未读时红色显示「未读/总数」，否则灰色只显示总数
const getInboxBadge = ({ unread = 0, total = 0 } = {}) => {
  if (unread > 0) {
    return { count: `${formatCount(unread)}/${formatCount(total)}`, danger: true };
  }
  return { count: total, danger: false };
};

const Sidebar = createWithRemoteLoader({
  modules: ['components-core:Menu']
})(
  withLocale(({ remoteModules, baseUrl, withAppMenu = true, accounts, accountId, onAccountChange, current, onCurrentChange, stats, onCompose }) => {
    const [Menu] = remoteModules;
    const { formatMessage } = useIntl();
    const folders = stats?.folders || {};
    const labels = stats?.labels || [];
    const inboxBadge = getInboxBadge(folders.inbox);

    return (
      <Flex vertical gap={12} className={style['sidebar']}>
        <Select
          variant="filled"
          value={accountId || ''}
          onChange={value => onAccountChange(value || null)}
          options={[
            { label: formatMessage({ id: 'AllAccounts' }), value: '' },
            ...accounts.map(item => ({ label: `${item.name} <${item.address}>`, value: item.id }))
          ]}
        />
        <Button type="primary" block icon={<FormOutlined />} onClick={onCompose}>
          {formatMessage({ id: 'Compose' })}
        </Button>
        <Menu
          allowCollapsed={false}
          currentKey={current}
          onChange={onCurrentChange}
          items={[
            {
              key: 'inbox',
              icon: <InboxOutlined />,
              label: <MenuLabel text={formatMessage({ id: 'Inbox' })} count={inboxBadge.count} danger={inboxBadge.danger} />
            },
            { key: 'sent', icon: <SendOutlined />, label: <MenuLabel text={formatMessage({ id: 'Sent' })} /> },
            { key: 'draft', icon: <EditOutlined />, label: <MenuLabel text={formatMessage({ id: 'Draft' })} count={folders.draft?.total} /> },
            { key: 'trash', icon: <DeleteOutlined />, label: <MenuLabel text={formatMessage({ id: 'Trash' })} /> },
            ...(labels.length > 0
              ? [
                  {
                    key: 'labels',
                    icon: <TagsOutlined />,
                    label: formatMessage({ id: 'Label' }),
                    children: labels.map(label => ({
                      key: `label:${label.id}`,
                      label: <MenuLabel text={label.name} count={label.unread} color={label.color} />
                    }))
                  }
                ]
              : [])
          ]}
        />
        {withAppMenu && (
          <>
            <Divider className={style['sidebar-divider']} />
            <AppMenu baseUrl={baseUrl} withMailbox={false} />
          </>
        )}
      </Flex>
    );
  })
);

export default Sidebar;
