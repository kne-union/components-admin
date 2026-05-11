import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import { stringifyJson } from './utils';

const getTraceColumns = ({ formatMessage }) => {
  return [
    {
      name: 'id',
      title: formatMessage({ id: 'ID' }),
      type: 'serialNumber'
    },
    {
      name: 'traceId',
      title: formatMessage({ id: 'TraceId' }),
      ellipsis: true,
      copyable: true
    },
    {
      name: 'topic',
      title: formatMessage({ id: 'Topic' }),
      type: 'tag',
      valueOf: ({ topic }) =>
        topic && {
          type: 'info',
          text: topic
        }
    },
    {
      name: 'event',
      title: formatMessage({ id: 'Event' }),
      type: 'tag',
      valueOf: ({ event }) => ({
        isEnum: true,
        moduleName: 'traceEvent',
        name: event
      })
    },
    {
      name: 'messageId',
      title: formatMessage({ id: 'MessageId' }),
      ellipsis: true,
      copyable: true
    },
    {
      name: 'detail',
      title: formatMessage({ id: 'Detail' }),
      ellipsis: true,
      width: 200,
      valueOf: ({ detail }) => stringifyJson(detail)
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      type: 'datetime'
    }
  ];
};

export const TraceColumnsLoader = withLocale(({ children }) => {
  const { formatMessage } = useIntl();
  return children(props => getTraceColumns(Object.assign({}, props, { formatMessage })));
});

export default getTraceColumns;
