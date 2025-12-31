const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'id',
      title: formatMessage({ id: 'ID' }),
      type: 'serialNumber'
    },
    {
      name: 'type',
      title: formatMessage({ id: 'Type' }),
      type: 'tag',
      valueOf: ({ type }) =>
        type && {
          isEnum: true,
          moduleName: 'taskType',
          name: type
        }
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      type: 'tag',
      valueOf: ({ status }) =>
        status && {
          isEnum: true,
          moduleName: 'taskStatus',
          name: status
        }
    },
    {
      name: 'name',
      title: formatMessage({ id: 'TargetName' }),
      type: 'description',
      valueOf: item => {
        return item.input?.name;
      }
    },
    {
      name: 'runnerType',
      title: formatMessage({ id: 'ExecutionMode' }),
      valueOf: item => {
        return item.runnerType === 'manual' ? formatMessage({ id: 'ManualExecution' }) : formatMessage({ id: 'AutomaticExecution' });
      }
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      type: 'datetime'
    },
    {
      name: 'completedAt',
      title: formatMessage({ id: 'CompletedAt' }),
      type: 'datetime',
      sort: true
    },
    {
      name: 'updatedAt',
      title: formatMessage({ id: 'UpdatedAt' }),
      type: 'datetime',
      sort: true
    }
  ];
};

export default getColumns;
