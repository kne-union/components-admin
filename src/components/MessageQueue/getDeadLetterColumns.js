import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import { stringifyJson } from './utils';

const getDeadLetterColumns = ({ formatMessage }) => {
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
      name: 'originalId',
      title: formatMessage({ id: 'OriginalMessageId' }),
      ellipsis: true,
      copyable: true
    },
    {
      name: 'errorMessage',
      title: formatMessage({ id: 'ErrorMessage' }),
      ellipsis: true,
      width: 200
    },
    {
      name: 'payload',
      title: formatMessage({ id: 'Payload' }),
      ellipsis: true,
      getValueOf: ({ payload }) => stringifyJson(payload)
    },
    {
      name: 'replayed',
      title: formatMessage({ id: 'Replayed' }),
      renderType: 'enum',
      moduleName: 'mqBoolean',
      getValueOf: item => !!item.replayed
    },
    {
      name: 'replayedAt',
      title: formatMessage({ id: 'ReplayedAt' }),
      format: 'datetime'
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      format: 'datetime'
    }
  ];
};

export const DeadLetterColumnsLoader = withLocale(({ children }) => {
  const { formatMessage } = useIntl();
  return children(props => getDeadLetterColumns(Object.assign({}, props, { formatMessage })));
});

export default getDeadLetterColumns;
