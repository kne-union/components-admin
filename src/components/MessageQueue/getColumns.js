import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import { stringifyJson } from './utils';

const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'id',
      title: formatMessage({ id: 'ID' }),
      type: 'serialNumber'
    },
    {
      name: 'topic',
      title: formatMessage({ id: 'Topic' }),
      type: 'tag',
      ellipsis: true,
      valueOf: ({ topic }) =>
        topic && {
          type: 'info',
          text: topic
        }
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      type: 'tag',
      valueOf: ({ status }) =>
        status && {
          isEnum: true,
          moduleName: 'messageStatus',
          name: status
        }
    },
    {
      name: 'payload',
      title: formatMessage({ id: 'Payload' }),
      ellipsis: true,
      valueOf: ({ payload }) => stringifyJson(payload)
    },
    {
      name: 'retryCount',
      title: formatMessage({ id: 'RetryCount' }),
      width: 100
    },
    {
      name: 'maxRetries',
      title: formatMessage({ id: 'MaxRetries' }),
      width: 100
    },
    {
      name: 'priority',
      title: formatMessage({ id: 'Priority' }),
      width: 80
    },
    {
      name: 'traceId',
      title: formatMessage({ id: 'TraceId' }),
      ellipsis: true,
      copyable: true
    },
    {
      name: 'consumerId',
      title: formatMessage({ id: 'ConsumerId' }),
      ellipsis: true
    },
    {
      name: 'executeAt',
      title: formatMessage({ id: 'ExecuteAt' }),
      type: 'datetime'
    },
    {
      name: 'nextRetryAt',
      title: formatMessage({ id: 'NextRetryAt' }),
      type: 'datetime'
    },
    {
      name: 'lockedAt',
      title: formatMessage({ id: 'LockedAt' }),
      type: 'datetime'
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      type: 'datetime'
    },
    {
      name: 'updatedAt',
      title: formatMessage({ id: 'UpdatedAt' }),
      type: 'datetime'
    }
  ];
};

export const ColumnsLoader = withLocale(({ children }) => {
  const { formatMessage } = useIntl();
  return children(props => getColumns(Object.assign({}, props, { formatMessage })));
});

export default getColumns;
