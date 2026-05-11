import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import { stringifyJson } from './utils';

const getDeadLetterColumns = ({ formatMessage }) => {
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
      valueOf: ({ payload }) => stringifyJson(payload)
    },
    {
      name: 'replayed',
      title: formatMessage({ id: 'Replayed' }),
      type: 'tag',
      valueOf: ({ replayed }) => ({
        isEnum: true,
        moduleName: 'mqBoolean',
        name: !!replayed
      })
    },
    {
      name: 'replayedAt',
      title: formatMessage({ id: 'ReplayedAt' }),
      type: 'datetime'
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      type: 'datetime'
    }
  ];
};

export const DeadLetterColumnsLoader = withLocale(({ children }) => {
  const { formatMessage } = useIntl();
  return children(props => getDeadLetterColumns(Object.assign({}, props, { formatMessage })));
});

export default getDeadLetterColumns;
