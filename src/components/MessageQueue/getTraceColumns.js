import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import { stringifyJson } from './utils';

const getTraceColumns = ({ formatMessage }) => {
  return [
    {
      name: 'id',
      title: formatMessage({ id: 'ID' }),
      renderType: 'id'
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
      renderType: 'tag',
      getValueOf: ({ topic }) =>
        topic && {
          type: 'info',
          text: topic
        }
    },
    {
      name: 'event',
      title: formatMessage({ id: 'Event' }),
      renderType: 'enum',
      moduleName: 'traceEvent',
      getValueOf: item => item.event
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
      getValueOf: ({ detail }) => stringifyJson(detail)
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      format: 'datetime'
    }
  ];
};

export const TraceColumnsLoader = withLocale(({ children }) => {
  const { formatMessage } = useIntl();
  return children(props => getTraceColumns(Object.assign({}, props, { formatMessage })));
});

export default getTraceColumns;
