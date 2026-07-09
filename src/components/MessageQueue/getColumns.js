import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import { stringifyJson } from './utils';

const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'id',
      title: formatMessage({ id: 'ID' }),
      renderType: 'small'
    },
    {
      name: 'topic',
      title: formatMessage({ id: 'Topic' }),
      renderType: 'tag',
      ellipsis: true,
      getValueOf: ({ topic }) =>
        topic && {
          type: 'info',
          text: topic
        }
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      renderType: 'enum',
      moduleName: 'messageStatus',
      getValueOf: item => item.status
    },
    {
      name: 'payload',
      title: formatMessage({ id: 'Payload' }),
      ellipsis: true,
      getValueOf: ({ payload }) => stringifyJson(payload)
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
      format: 'datetime'
    },
    {
      name: 'nextRetryAt',
      title: formatMessage({ id: 'NextRetryAt' }),
      format: 'datetime'
    },
    {
      name: 'lockedAt',
      title: formatMessage({ id: 'LockedAt' }),
      format: 'datetime'
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      format: 'datetime'
    },
    {
      name: 'updatedAt',
      title: formatMessage({ id: 'UpdatedAt' }),
      format: 'datetime'
    }
  ];
};

export const ColumnsLoader = withLocale(({ children }) => {
  const { formatMessage } = useIntl();
  return children(props => getColumns(Object.assign({}, props, { formatMessage })));
});

export default getColumns;
