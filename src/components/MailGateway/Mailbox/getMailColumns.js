import { Tag, Typography } from 'antd';
import classnames from 'classnames';
import { formatAddressNames } from '../utils';
import { formatDateTime } from '../CardList';
import { AddressList } from '../Contact/AddressText';
import style from '../style.module.scss';

export const getMailCardItem = ({ formatMessage, folder, showAccount, accountMap, onOpen, onStar }) => {
  const isOutgoing = folder === 'sent' || folder === 'draft';
  return item => {
    const attachmentCount = (item.attachments || []).length;
    const unreadClassName = classnames({ [style['is-unread']]: !item.isRead });
    return {
      leading: (
        <span
          role="button"
          title={formatMessage({ id: item.isStarred ? 'Unstar' : 'Star' })}
          className={classnames(style['star'], { [style['is-starred']]: item.isStarred })}
          onClick={e => {
            e.stopPropagation();
            onStar(item);
          }}
        >
          {item.isStarred ? '★' : '☆'}
        </span>
      ),
      title: (
        <span className={unreadClassName}>
          <AddressList list={isOutgoing ? item.to : item.from} empty="-" />
        </span>
      ),
      extra: formatDateTime(item.date),
      subtitle: (
        <>
          {(item.labels || []).map(label => (
            <Tag key={label.id} color={label.color} className={style['mail-label-tag']}>
              {label.name}
            </Tag>
          ))}
          <span className={unreadClassName}>{item.subject || formatMessage({ id: 'NoSubject' })}</span>
        </>
      ),
      description: item.summary,
      footer:
        [
          showAccount && accountMap.get(String(item.accountId))?.name,
          attachmentCount > 0 && `${formatMessage({ id: 'Attachment' })} ${formatMessage({ id: 'AttachmentShort' }, { count: attachmentCount })}`
        ]
          .filter(Boolean)
          .join(' · ') || null,
      onClick: () => onOpen(item)
    };
  };
};

const getMailColumns = ({ formatMessage, folder, showAccount, accountMap, onOpen, onStar, onOpenAccount }) => {
  const isOutgoing = folder === 'sent' || folder === 'draft';
  return [
    {
      name: 'isStarred',
      title: '\u00a0',
      width: 48,
      render: (value, { dataSource }) => (
        <span
          role="button"
          title={formatMessage({ id: value ? 'Unstar' : 'Star' })}
          className={classnames(style['star'], { [style['is-starred']]: value })}
          onClick={e => {
            e.stopPropagation();
            onStar(dataSource);
          }}
        >
          {value ? '★' : '☆'}
        </span>
      )
    },
    {
      name: isOutgoing ? 'to' : 'from',
      title: formatMessage({ id: isOutgoing ? 'To' : 'From' }),
      width: 180,
      ellipsis: true,
      getValueOf: item => formatAddressNames(isOutgoing ? item.to : item.from) || '-',
      render: (value, { dataSource }) => (
        <span className={classnames({ [style['is-unread']]: !dataSource.isRead })}>
          <AddressList list={isOutgoing ? dataSource.to : dataSource.from} empty="-" />
        </span>
      )
    },
    {
      name: 'subject',
      title: formatMessage({ id: 'Subject' }),
      min: 320,
      ellipsis: true,
      getValueOf: item => item.subject || formatMessage({ id: 'NoSubject' }),
      render: (value, { dataSource }) => (
        <span className={style['mail-subject-cell']} onClick={() => onOpen(dataSource)}>
          {(dataSource.labels || []).map(label => (
            <Tag key={label.id} color={label.color} className={style['mail-label-tag']}>
              {label.name}
            </Tag>
          ))}
          <span className={classnames({ [style['is-unread']]: !dataSource.isRead })}>{value}</span>
          {dataSource.summary && <span className={style['mail-summary']}> - {dataSource.summary}</span>}
        </span>
      )
    },
    {
      name: 'attachments',
      title: formatMessage({ id: 'Attachment' }),
      width: 80,
      getValueOf: item => ((item.attachments || []).length > 0 ? formatMessage({ id: 'AttachmentShort' }, { count: item.attachments.length }) : '')
    },
    ...(showAccount
      ? [
          {
            name: 'accountId',
            title: formatMessage({ id: 'Account' }),
            width: 140,
            ellipsis: true,
            getValueOf: item => accountMap.get(String(item.accountId))?.name || '-',
            render: (value, { dataSource }) =>
              accountMap.has(String(dataSource.accountId)) ? (
                <Typography.Link onClick={() => onOpenAccount(accountMap.get(String(dataSource.accountId)))}>{value}</Typography.Link>
              ) : (
                value
              )
          }
        ]
      : []),
    {
      name: 'date',
      title: formatMessage({ id: 'Date' }),
      width: 160,
      format: 'datetime'
    }
  ];
};

export default getMailColumns;
