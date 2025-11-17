const getColumns = () => {
  return [
    {
      name: 'id',
      title: 'ID',
      type: 'serialNumber'
    },
    {
      name: 'type',
      title: '类型',
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
      title: '状态',
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
      title: '目标名称',
      type: 'description',
      valueOf: item => {
        return item.input?.name;
      }
    },
    {
      name: 'runnerType',
      title: '执行方式',
      valueOf: item => {
        return item.runnerType === 'manual' ? '手动执行' : '自动执行';
      }
    },
    {
      name: 'createdAt',
      title: '创建时间',
      type: 'datetime'
    },
    {
      name: 'completedAt',
      title: '完成时间',
      type: 'datetime',
      sort: true
    },
    {
      name: 'updatedAt',
      title: '更新时间',
      type: 'datetime',
      sort: true
    }
  ];
};

export default getColumns;
