import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'id',
      title: formatMessage({ id: 'ID' }),
      renderType: 'id'
    },
    {
      name: 'type',
      title: formatMessage({ id: 'Type' }),
      renderType: 'enum',
      moduleName: 'taskType',
      getValueOf: item => item.type
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      renderType: 'enum',
      moduleName: 'taskStatus',
      getValueOf: item => item.status
    },
    {
      name: 'name',
      title: formatMessage({ id: 'TargetName' }),
      renderType: 'description',
      getValueOf: item => {
        return item.input?.name;
      }
    },
    {
      name: 'runnerType',
      title: formatMessage({ id: 'ExecutionMode' }),
      getValueOf: item => {
        return item.runnerType === 'manual' ? formatMessage({ id: 'ManualExecution' }) : formatMessage({ id: 'AutomaticExecution' });
      }
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      format: 'datetime'
    },
    {
      name: 'completedAt',
      title: formatMessage({ id: 'CompletedAt' }),
      format: 'datetime',
      sort: true
    },
    {
      name: 'updatedAt',
      title: formatMessage({ id: 'UpdatedAt' }),
      format: 'datetime',
      sort: true
    }
  ];
};

export const ColumnsLoader = withLocale(({ children }) => {
  const { formatMessage } = useIntl();
  return children(props => getColumns(Object.assign({}, props, {formatMessage})));
});

export default getColumns;
